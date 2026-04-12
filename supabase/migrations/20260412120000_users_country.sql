ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS country text;

COMMENT ON COLUMN public.users.country IS 'Optional region hint for career suggestions (e.g. India, United States).';
