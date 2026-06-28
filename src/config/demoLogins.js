/**
 * Demo accounts for evaluators. Passwords come from VITE_DEMO_* env at build time only
 * (set in Hostinger / local .env — never commit). Disable after approval:
 * remove VITE_ENABLE_DEMO_LOGIN and rebuild.
 */
export function isDemoLoginEnabled() {
  if (import.meta.env.DEV) return true
  return import.meta.env.VITE_ENABLE_DEMO_LOGIN === 'true'
}

const accounts = [
  {
    id: 'parent',
    label: 'Parent',
    name: 'Priya Sharma',
    email:
      import.meta.env.VITE_DEMO_PARENT_EMAIL?.trim() ||
      'priya.sharma.parent@example.com',
    password: import.meta.env.VITE_DEMO_PARENT_PASSWORD || '',
  },
  {
    id: 'child',
    label: 'Child',
    name: 'Daksh Kapoor',
    email:
      import.meta.env.VITE_DEMO_CHILD_EMAIL?.trim() ||
      'daksh.kapoor.child@example.com',
    password: import.meta.env.VITE_DEMO_CHILD_PASSWORD || '',
  },
  {
    id: 'admin',
    label: 'Admin',
    name: 'Admin account',
    email:
      import.meta.env.VITE_DEMO_ADMIN_EMAIL?.trim() ||
      'admin@kidscareerdecoder.com',
    password: import.meta.env.VITE_DEMO_ADMIN_PASSWORD || '',
  },
]

/** Accounts with email + password configured (passwords not stored in source). */
export const DEMO_ACCOUNTS = accounts.filter(
  (a) => a.email && a.password.length > 0,
)
