import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { getPool } from '../db/pool.js'
import { isMailConfigured, sendMail } from '../services/mail.js'

const TOKEN_BYTES = 32
const EXPIRY_HOURS = 1

function hashToken(raw) {
  return crypto.createHash('sha256').update(raw, 'utf8').digest('hex')
}

function isChildInternalEmail(email) {
  return String(email).toLowerCase().endsWith('@child.kidscareerdecoder.internal')
}

function publicAppOrigin() {
  const u = process.env.PUBLIC_APP_URL?.trim()
  if (u) return u.replace(/\/$/, '')
  return ''
}

/** Generic success copy so we do not reveal whether the email exists. */
const GENERIC_FORGOT_MESSAGE =
  'If an account exists for that email, we sent a reset link. Check your inbox.'

export async function requestPasswordReset(req, res) {
  try {
    if (!isMailConfigured()) {
      res.status(503).json({
        error:
          'Password reset email is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and MAIL_FROM (Brevo SMTP).',
      })
      return
    }

    const emailRaw = req.body?.email
    if (!emailRaw || !String(emailRaw).trim()) {
      res.status(400).json({ error: 'email is required' })
      return
    }
    const normalizedEmail = String(emailRaw).trim().toLowerCase()
    if (isChildInternalEmail(normalizedEmail)) {
      res.json({ message: GENERIC_FORGOT_MESSAGE })
      return
    }

    const pool = getPool()
    const { rows } = await pool.query(
      `SELECT id, email::text AS email, full_name, password_hash, role
       FROM public.users WHERE email = $1::citext LIMIT 1`,
      [normalizedEmail],
    )
    const user = rows[0]

    if (!user?.password_hash) {
      res.json({ message: GENERIC_FORGOT_MESSAGE })
      return
    }

    if (user.role !== 'parent' && user.role !== 'admin') {
      res.json({ message: GENERIC_FORGOT_MESSAGE })
      return
    }

    const rawToken = crypto.randomBytes(TOKEN_BYTES).toString('hex')
    const tokenHash = hashToken(rawToken)
    const id = uuidv4()
    const expiresAt = new Date(Date.now() + EXPIRY_HOURS * 60 * 60 * 1000)

    await pool.query(`DELETE FROM public.password_reset_tokens WHERE user_id = $1`, [
      user.id,
    ])
    await pool.query(
      `INSERT INTO public.password_reset_tokens (id, user_id, token_hash, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [id, user.id, tokenHash, expiresAt.toISOString()],
    )

    const base = publicAppOrigin()
    if (!base) {
      res.status(503).json({
        error:
          'PUBLIC_APP_URL is not set (e.g. https://app.kidscareerdecoder.com). Cannot build reset link.',
      })
      return
    }

    const resetUrl = `${base}/reset-password?token=${encodeURIComponent(rawToken)}`
    const subject = 'Reset your KidsCareer Decoder password'
    const text = `Hi ${user.full_name},

We received a request to reset your password. Open this link (valid about ${EXPIRY_HOURS} hour):

${resetUrl}

If you did not ask for this, you can ignore this email.

— KidsCareer Decoder`

    const sent = await sendMail(user.email, subject, text)
    if (!sent.ok) {
      await pool.query(`DELETE FROM public.password_reset_tokens WHERE id = $1`, [id])
      res.status(500).json({
        error: sent.error || 'Failed to send email',
      })
      return
    }

    res.json({ message: GENERIC_FORGOT_MESSAGE })
  } catch (err) {
    if (err && typeof err === 'object' && 'code' in err && err.code === '42P01') {
      res.status(503).json({
        error:
          'Database migration missing: run supabase/migrations/20260405120000_password_reset_tokens.sql',
      })
      return
    }
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Server error',
    })
  }
}

export async function resetPasswordWithToken(req, res) {
  try {
    const token = String(req.body?.token ?? '').trim()
    const password = req.body?.password
    if (!token) {
      res.status(400).json({ error: 'token is required' })
      return
    }
    if (!password || String(password).length < 8) {
      res.status(400).json({ error: 'password must be at least 8 characters' })
      return
    }

    const tokenHash = hashToken(token)
    const pool = getPool()
    const { rows } = await pool.query(
      `SELECT t.id AS token_id, t.user_id, t.expires_at, u.email::text AS email, u.role
       FROM public.password_reset_tokens t
       JOIN public.users u ON u.id = t.user_id
       WHERE t.token_hash = $1 LIMIT 1`,
      [tokenHash],
    )
    const row = rows[0]
    if (!row) {
      res.status(400).json({ error: 'Invalid or expired reset link' })
      return
    }
    const exp = new Date(row.expires_at)
    if (Number.isNaN(exp.getTime()) || exp < new Date()) {
      await pool.query(`DELETE FROM public.password_reset_tokens WHERE id = $1`, [
        row.token_id,
      ])
      res.status(400).json({ error: 'Invalid or expired reset link' })
      return
    }
    if (row.role !== 'parent' && row.role !== 'admin') {
      res.status(400).json({ error: 'This account cannot use password reset' })
      return
    }

    const passwordHash = await bcrypt.hash(String(password), 10)
    await pool.query(
      `UPDATE public.users SET password_hash = $1, updated_at = now() WHERE id = $2`,
      [passwordHash, row.user_id],
    )
    await pool.query(`DELETE FROM public.password_reset_tokens WHERE user_id = $1`, [
      row.user_id,
    ])

    res.json({ message: 'Password updated. You can sign in with your new password.' })
  } catch (err) {
    if (err && typeof err === 'object' && 'code' in err && err.code === '42P01') {
      res.status(503).json({
        error:
          'Database migration missing: run supabase/migrations/20260405120000_password_reset_tokens.sql',
      })
      return
    }
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Server error',
    })
  }
}
