-- Create or update admin@kidscareerdecoder.com with a known password (change after first login).
-- Uses PostgreSQL pgcrypto bcrypt — compatible with Node bcryptjs used by the app.
-- Run in Supabase SQL Editor after enabling extension (usually allowed).

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO public.users (
  id,
  email,
  password_hash,
  full_name,
  role,
  parent_user_id,
  updated_at
)
VALUES (
  gen_random_uuid()::text,
  'admin@kidscareerdecoder.com'::citext,
  crypt('CHANGE_ME_ADMIN_PASSWORD', gen_salt('bf', 10)),
  'Site Admin',
  'admin',
  NULL,
  now()
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = 'admin',
  full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.users.full_name),
  updated_at = now();
