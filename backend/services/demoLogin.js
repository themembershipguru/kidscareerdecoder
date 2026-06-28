/** Server-side demo logins — optional env overrides; works out of the box for seeded demo users. */

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

/** Matches supabase/seed_dummy_users.sql and ensure_admin_account.sql */
const DEFAULT_PASSWORD = {
  parent: 'Password123!',
  child: 'Password123!',
  admin: 'Password123#',
}

/** On by default; set DEMO_LOGIN_ENABLED=false after approval to hide quick sign-in. */
export function isDemoLoginEnabled() {
  return process.env.DEMO_LOGIN_ENABLED !== 'false'
}

function envKey(role, field) {
  return `DEMO_${role.toUpperCase()}_${field}`
}

export function getDemoCredentials(role) {
  if (!ROLES.includes(role)) return null
  const email =
    process.env[envKey(role, 'EMAIL')]?.trim() || DEFAULT_EMAIL[role]
  const password =
    process.env[envKey(role, 'PASSWORD')] || DEFAULT_PASSWORD[role]
  if (!email || !password) return null
  return { email, password }
}

/** Public labels only — no passwords. */
export function listDemoAccountOptions() {
  if (!isDemoLoginEnabled()) return []
  return ROLES.map((id) => {
    const creds = getDemoCredentials(id)
    if (!creds) return null
    return { id, ...LABELS[id] }
  }).filter(Boolean)
}
