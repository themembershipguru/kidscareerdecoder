CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_status_completed
  ON public.quiz_sessions (user_id, status, completed_at DESC NULLS LAST);
