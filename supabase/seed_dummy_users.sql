-- Dummy users for local/demo (run in Supabase SQL editor)
-- Password for every account below: CHANGE_ME_DEMO_PASSWORD
--
-- Note: The current KidsCareerDecoder login flow does NOT verify password_hash yet;
-- it only looks up users by email. These hashes are ready for when you add real auth.
-- Requires: pgcrypto (usually available on Supabase)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Needed for child age on parent dashboard (safe if you already ran the repo migration)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS birth_year smallint;

-- Parents
INSERT INTO public.users (id, email, password_hash, full_name, role, parent_user_id, birth_year, updated_at)
VALUES
  (
    'seed-parent-lena',
    'lena.parent@example.com',
    crypt('CHANGE_ME_DEMO_PASSWORD', gen_salt('bf')),
    'Lena Martinez',
    'parent',
    NULL,
    NULL,
    now()
  ),
  (
    'seed-parent-raj',
    'raj.parent@example.com',
    crypt('CHANGE_ME_DEMO_PASSWORD', gen_salt('bf')),
    'Raj Kapoor',
    'parent',
    NULL,
    NULL,
    now()
  )
ON CONFLICT (email) DO NOTHING;

-- Children (linked to parents; sign-in with these emails on the login page)
INSERT INTO public.users (id, email, password_hash, full_name, role, parent_user_id, birth_year, updated_at)
VALUES
  (
    'seed-child-sam',
    'sam.martinez.child@example.com',
    crypt('CHANGE_ME_DEMO_PASSWORD', gen_salt('bf')),
    'Sam Martinez',
    'child',
    'seed-parent-lena',
    2016,
    now()
  ),
  (
    'seed-child-maya',
    'maya.martinez.child@example.com',
    crypt('CHANGE_ME_DEMO_PASSWORD', gen_salt('bf')),
    'Maya Martinez',
    'child',
    'seed-parent-lena',
    2014,
    now()
  ),
  (
    'seed-child-dev',
    'dev.kapoor.child@example.com',
    crypt('CHANGE_ME_DEMO_PASSWORD', gen_salt('bf')),
    'Dev Kapoor',
    'child',
    'seed-parent-raj',
    2015,
    now()
  )
ON CONFLICT (email) DO NOTHING;
