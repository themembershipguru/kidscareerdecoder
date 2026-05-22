/**
 * Demo accounts for evaluators (Qollabb / viva). Disable after approval:
 * remove VITE_ENABLE_DEMO_LOGIN from production env and rebuild.
 */
export function isDemoLoginEnabled() {
  if (import.meta.env.DEV) return true
  return import.meta.env.VITE_ENABLE_DEMO_LOGIN === 'true'
}

/** Default passwords match supabase/seed_dummy_users.sql and ensure_admin_account.sql */
export const DEMO_ACCOUNTS = [
  {
    id: 'parent',
    label: 'Parent',
    name: 'Priya Sharma',
    hint: 'Dashboard & reports',
    email:
      import.meta.env.VITE_DEMO_PARENT_EMAIL?.trim() ||
      'priya.sharma.parent@example.com',
    password:
      import.meta.env.VITE_DEMO_PARENT_PASSWORD || 'CHANGE_ME_DEMO_PASSWORD',
  },
  {
    id: 'child',
    label: 'Child',
    name: 'Daksh Kapoor',
    hint: 'Quizzes & results',
    email:
      import.meta.env.VITE_DEMO_CHILD_EMAIL?.trim() ||
      'daksh.kapoor.child@example.com',
    password:
      import.meta.env.VITE_DEMO_CHILD_PASSWORD || 'CHANGE_ME_DEMO_PASSWORD',
  },
  {
    id: 'admin',
    label: 'Admin',
    name: 'Admin account',
    hint: 'Insights & quizzes',
    email:
      import.meta.env.VITE_DEMO_ADMIN_EMAIL?.trim() ||
      'admin@kidscareerdecoder.com',
    password:
      import.meta.env.VITE_DEMO_ADMIN_PASSWORD || 'CHANGE_ME_ADMIN_PASSWORD',
  },
]
