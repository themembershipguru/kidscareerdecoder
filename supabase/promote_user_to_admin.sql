UPDATE public.users
SET role = 'admin', updated_at = now()
WHERE email = 'your-email@example.com'::citext;
