-- Admin expansion: UTM / attribution, session attribution, runtime AI provider override

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS attribution_json jsonb;

ALTER TABLE public.quiz_sessions
  ADD COLUMN IF NOT EXISTS attribution_json jsonb;

CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON COLUMN public.users.attribution_json IS 'Marketing attribution (utm_*, referrer, etc.) captured at signup.';
COMMENT ON COLUMN public.quiz_sessions.attribution_json IS 'Optional campaign context when the session was started.';
COMMENT ON TABLE public.app_settings IS 'Key-value platform settings (e.g. ai_provider override).';
