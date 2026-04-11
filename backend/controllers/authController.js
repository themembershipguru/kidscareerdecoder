import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { getPool } from '../db/pool.js'

function childSignInEmail() {
  return `${uuidv4().replace(/-/g, '')}@child.kidscareerdecoder.internal`
}

function generateInitialChildPassword() {
  const raw = uuidv4().replace(/-/g, '').slice(0, 16)
  return `Kcd${raw}1!`
}

/** @param {Record<string, unknown> | null | undefined} body */
function buildAttributionFromBody(body) {
  if (!body || typeof body !== 'object') return null
  const fromNested =
    body.attribution && typeof body.attribution === 'object' && !Array.isArray(body.attribution)
      ? body.attribution
      : body
  const keys = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
    'referrer',
    'landing_path',
  ]
  const out = {}
  for (const k of keys) {
    const v = fromNested[k]
    if (v != null && String(v).trim()) {
      out[k] = String(v).trim().slice(0, 500)
    }
  }
  return Object.keys(out).length ? out : null
}

export async function registerParent(req, res) {
  try {
    const { full_name: fullName, email, password } = req.body
    if (!fullName || !email || !password) {
      res.status(400).json({ error: 'full_name, email, and password are required' })
      return
    }
    const normalizedEmail = String(email).trim().toLowerCase()
    const pool = getPool()
    const taken = await pool.query(
      `SELECT id FROM public.users WHERE email = $1::citext LIMIT 1`,
      [normalizedEmail],
    )
    if (taken.rows.length) {
      res.status(409).json({ error: 'Email already registered' })
      return
    }
    const id = uuidv4()
    const passwordHash = await bcrypt.hash(String(password), 10)
    const now = new Date().toISOString()
    const attribution = buildAttributionFromBody(req.body)
    await pool.query(
      `INSERT INTO public.users (
         id, email, password_hash, full_name, role, parent_user_id, updated_at, attribution_json
       ) VALUES ($1, $2::citext, $3, $4, 'parent', NULL, $5::timestamptz, $6::jsonb)`,
      [
        id,
        normalizedEmail,
        passwordHash,
        String(fullName).trim(),
        now,
        attribution ? JSON.stringify(attribution) : null,
      ],
    )
    res.status(201).json({ message: 'Registration successful' })
  } catch (err) {
    if (err && typeof err === 'object' && 'code' in err && err.code === '23505') {
      res.status(409).json({ error: 'Email already registered' })
      return
    }
    res.status(500).json({ error: err instanceof Error ? err.message : 'Server error' })
  }
}

export async function loginParent(req, res) {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      res.status(400).json({ error: 'email and password are required' })
      return
    }
    const normalizedEmail = String(email).trim().toLowerCase()
    const pool = getPool()
    const { rows } = await pool.query(
      `SELECT id, email::text AS email, full_name, role, password_hash
       FROM public.users WHERE email = $1::citext LIMIT 1`,
      [normalizedEmail],
    )
    const user = rows[0]
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }
    if (!user.password_hash) {
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }
    const ok = await bcrypt.compare(String(password), user.password_hash)
    if (!ok) {
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }
    const secret = process.env.JWT_SECRET
    if (!secret) {
      res.status(500).json({ error: 'Server misconfiguration' })
      return
    }
    const payload = {
      id: user.id,
      full_name: user.full_name,
      role: user.role,
      email: user.email,
    }
    const token = jwt.sign(payload, secret, { expiresIn: '7d' })
    res.json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        role: user.role,
        email: user.email,
      },
    })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Server error' })
  }
}

export async function addChild(req, res) {
  try {
    const { full_name: fullName, date_of_birth: dateOfBirth } = req.body
    if (!fullName || !dateOfBirth) {
      res.status(400).json({ error: 'full_name and date_of_birth are required' })
      return
    }
    const dob = new Date(String(dateOfBirth))
    if (Number.isNaN(dob.getTime())) {
      res.status(400).json({ error: 'Invalid date_of_birth' })
      return
    }
    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    const m = today.getMonth() - dob.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age -= 1
    if (age < 3 || age > 14) {
      res.status(400).json({ error: 'Child must be between 3 and 14 years old' })
      return
    }
    const id = uuidv4()
    const email = childSignInEmail()
    const birthYear = dob.getFullYear()
    const initialPassword = generateInitialChildPassword()
    const passwordHash = await bcrypt.hash(initialPassword, 10)
    const dobStr = dob.toISOString().slice(0, 10)
    const now = new Date().toISOString()
    const pool = getPool()
    const { rows, rowCount } = await pool.query(
      `INSERT INTO public.users (
         id, email, password_hash, full_name, role, parent_user_id, birth_year, date_of_birth, updated_at
       ) VALUES (
         $1, $2::citext, $3, $4, 'child', $5, $6, $7::date, $8::timestamptz
       )
       RETURNING id, full_name, role, email::text AS email, parent_user_id, date_of_birth, birth_year`,
      [id, email, passwordHash, String(fullName).trim(), req.user.id, birthYear, dobStr, now],
    )
    if (!rowCount) {
      res.status(500).json({ error: 'Insert failed' })
      return
    }
    const data = rows[0]
    res.status(201).json({
      id: data.id,
      full_name: data.full_name,
      role: data.role,
      email: data.email,
      parent_user_id: data.parent_user_id,
      date_of_birth: data.date_of_birth,
      birth_year: data.birth_year,
      initialPassword,
    })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Server error' })
  }
}

export async function getChildren(req, res) {
  try {
    const pool = getPool()
    const sql =
      req.user.role === 'admin'
        ? `SELECT id, full_name, role, email::text AS email, parent_user_id, birth_year, date_of_birth, created_at
           FROM public.users
           WHERE role = 'child'
           ORDER BY created_at ASC`
        : `SELECT id, full_name, role, email::text AS email, parent_user_id, birth_year, date_of_birth, created_at
           FROM public.users
           WHERE parent_user_id = $1 AND role = 'child'
           ORDER BY created_at ASC`
    const { rows } =
      req.user.role === 'admin'
        ? await pool.query(sql)
        : await pool.query(sql, [req.user.id])
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Server error' })
  }
}
