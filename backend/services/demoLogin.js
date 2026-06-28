/** Server-side demo logins — passwords only in runtime env (never in client bundle or git). */

const ROLES = ['parent', 'child', 'admin']

const LABELS = {
  parent: { label: 'Parent', name: 'Priya Sharma' },
  child: { label: 'Child', name: 'Daksh Kapoor' },
  admin: { label: 'Admin', name: 'Admin account' },
}

const DEFAULT_EMAIL = {
  parent: 'priya.sharma.parent@example.com',
  child: 'daksh.kapoor.child@example.com',
  admin: 'admin@kidscareerdecoder.com',
}

export function isDemoLoginEnabled() {
  return process.env.DEMO_LOGIN_ENABLED === 'true'
}

function envKey(role, field) {
  return `DEMO_${role.toUpperCase()}_${field}`
}

export function getDemoCredentials(role) {
  if (!ROLES.includes(role)) return null
  const email =
    process.env[envKey(role, 'EMAIL')]?.trim() || DEFAULT_EMAIL[role]
  const password = process.env[envKey(role, 'PASSWORD')] || ''
  if (!email || !password) return null
  return { email, password }
}

/** Public labels only — no passwords. */
export function listDemoAccountOptions() {
  return ROLES.map((id) => {
    const creds = getDemoCredentials(id)
    if (!creds) return null
    return { id, ...LABELS[id] }
  }).filter(Boolean)
}
