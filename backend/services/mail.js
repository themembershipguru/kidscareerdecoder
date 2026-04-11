import nodemailer from 'nodemailer'

/**
 * Brevo (and most providers): set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM.
 * Brevo SMTP: host smtp-relay.brevo.com, port 587, user = your Brevo login email,
 * pass = SMTP key from Brevo → SMTP & API → SMTP.
 */
export function isMailConfigured() {
  return Boolean(
    process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim() &&
      process.env.MAIL_FROM?.trim(),
  )
}

function createTransport() {
  const host = process.env.SMTP_HOST?.trim() || 'smtp-relay.brevo.com'
  const port = Number(process.env.SMTP_PORT) || 587
  const user = process.env.SMTP_USER?.trim()
  const pass = process.env.SMTP_PASS?.trim()
  if (!user || !pass) return null
  const secure = port === 465
  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  })
}

/**
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @param {string} [html]
 */
export async function sendMail(to, subject, text, html) {
  const transport = createTransport()
  if (!transport) {
    return { ok: false, error: 'SMTP is not configured' }
  }
  const from = process.env.MAIL_FROM?.trim()
  if (!from) {
    return { ok: false, error: 'MAIL_FROM is not set' }
  }
  try {
    await transport.sendMail({
      from,
      to,
      subject,
      text,
      html: html ?? text.replace(/\n/g, '<br/>'),
    })
    return { ok: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[mail] send failed:', msg)
    return { ok: false, error: msg }
  }
}
