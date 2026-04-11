-- Optional birth year for child profiles (used to show age on parent dashboard)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS birth_year smallint;

COMMENT ON COLUMN public.users.birth_year IS 'Calendar year of birth for child accounts; null for parents.';
