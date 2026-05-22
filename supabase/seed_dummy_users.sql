-- Dummy users for local/demo (run in Supabase SQL editor)
-- Password for every account below: CHANGE_ME_DEMO_PASSWORD
-- Requires: pgcrypto (usually available on Supabase)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS birth_year smallint;

-- Parents (Indian names)
INSERT INTO public.users (id, email, password_hash, full_name, role, parent_user_id, birth_year, updated_at)
VALUES
  (
    'seed-parent-priya',
    'priya.sharma.parent@example.com',
    crypt('CHANGE_ME_DEMO_PASSWORD', gen_salt('bf')),
    'Priya Sharma',
    'parent',
    NULL,
    NULL,
    now()
  ),
  (
    'seed-parent-vikram',
    'vikram.kapoor.parent@example.com',
    crypt('CHANGE_ME_DEMO_PASSWORD', gen_salt('bf')),
    'Vikram Kapoor',
    'parent',
    NULL,
    NULL,
    now()
  )
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  parent_user_id = EXCLUDED.parent_user_id,
  birth_year = EXCLUDED.birth_year,
  updated_at = EXCLUDED.updated_at;

-- Children (sign-in with these emails on the login page)
INSERT INTO public.users (id, email, password_hash, full_name, role, parent_user_id, birth_year, updated_at)
VALUES
  (
    'seed-child-aarav',
    'aarav.sharma.child@example.com',
    crypt('CHANGE_ME_DEMO_PASSWORD', gen_salt('bf')),
    'Aarav Sharma',
    'child',
    'seed-parent-priya',
    2016,
    now()
  ),
  (
    'seed-child-ananya',
    'ananya.sharma.child@example.com',
    crypt('CHANGE_ME_DEMO_PASSWORD', gen_salt('bf')),
    'Ananya Sharma',
    'child',
    'seed-parent-priya',
    2014,
    now()
  ),
  (
    'seed-child-daksh',
    'daksh.kapoor.child@example.com',
    crypt('CHANGE_ME_DEMO_PASSWORD', gen_salt('bf')),
    'Daksh Kapoor',
    'child',
    'seed-parent-vikram',
    2015,
    now()
  )
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  parent_user_id = EXCLUDED.parent_user_id,
  birth_year = EXCLUDED.birth_year,
  updated_at = EXCLUDED.updated_at;
