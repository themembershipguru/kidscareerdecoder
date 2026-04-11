-- One-time tokens for forgot-password flow (hashed at rest).

CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user
  ON public.password_reset_tokens (user_id);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires
  ON public.password_reset_tokens (expires_at);

ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
