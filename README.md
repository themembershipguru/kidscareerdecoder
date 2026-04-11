# KidsCareer Decoder

Full-stack aptitude quiz for kids: React (Vite) front end, Express API, and PostgreSQL via [Supabase](https://supabase.com).

## Setup

1. **Install**

   ```bash
   npm install
   ```

2. **Supabase** — In **SQL → New query**, run migrations **in order** (skip any that already ran):

   - `supabase/migrations/20250404000000_initial_schema.sql`
   - `supabase/migrations/20250411120000_users_birth_year.sql`
   - `supabase/migrations/20250420120000_users_date_of_birth.sql` — **required** for “Add child” and age; without it you get `column "date_of_birth" does not exist`
   - `supabase/migrations/20260204120000_analytics_session_index.sql` (optional, performance)
   - `supabase/migrations/20260404120000_admin_expansion_attribution_settings.sql` — **admin**: `users.attribution_json`, `quiz_sessions.attribution_json`, `app_settings` (AI provider override)
   - `supabase/migrations/20260405120000_password_reset_tokens.sql` — **forgot password** reset tokens
   - `supabase/migrations/20260406120000_five_additional_quizzes.sql` — five extra published quizzes (team play, inventors, outdoors, kindness, mysteries)
   - `supabase/migrations/20260411120000_adhd_autism_quizzes.sql` — two neuroaffirming quizzes: ADHD strengths (`adhd-spark-strengths`), autistic strengths (`autistic-strengths-shine`)

   **Bootstrap admin user (optional):** run `supabase/ensure_admin_account.sql` in the SQL editor to create or reset **`admin@kidscareerdecoder.com`** with password **`CHANGE_ME_ADMIN_PASSWORD`** (bcrypt via `pgcrypto`). Change the password after login or use **Forgot password** once SMTP is configured.

   **Follow-ups (not implemented):** admin audit log, CSV export of users/sessions, careers CRUD in admin UI, `POST /admin/sessions/:id/regenerate-insights` to re-run AI from stored answers.

   **Quick fix** if only `date_of_birth` is missing — paste and run:

   ```sql
   ALTER TABLE public.users
     ADD COLUMN IF NOT EXISTS date_of_birth date;
   ```

3. **Environment** — Copy `.env.example` to `.env` at the project root and set:

   - `DATABASE_URL` — Postgres URI from Supabase **Project Settings → Database → Connection string** (URI tab). Uses the **database password**, not the REST API keys.
   - `JWT_SECRET` — Required for login (`/api/auth/login`). Set a long random string on Hostinger and locally or auth returns 500.
   - `PUBLIC_APP_URL` — Public origin of the React app **without trailing slash** (e.g. `https://app.kidscareerdecoder.com`). Required for password-reset links in emails. Local dev: `http://localhost:5173`.
   - **Brevo SMTP** (forgot password): `SMTP_HOST` (default `smtp-relay.brevo.com`), `SMTP_PORT` (`587`), `SMTP_USER` (Brevo account email), `SMTP_PASS` (Brevo SMTP key), `MAIL_FROM` (verified sender, e.g. `KidsCareer Decoder <noreply@yourdomain.com>`). If unset, `POST /api/auth/forgot-password` returns **503** with a clear message.
   - **OpenAI** (`OPENAI_API_KEY`): optional for the main aptitude profile if you set the AI provider to OpenAI; also used by **Admin → Edit quiz → “AI label difficulty (1–5)”**, which calls `gpt-4o-mini` once per batch of questions and saves `questions.difficulty_level` for adaptive ordering (static DB; no live generation during play).

4. **Usage** — Register a parent → **Add child** (copy the child’s sign-in email) → sign in as that child → complete the quiz → parent dashboard shows **live** sessions from the database.

5. **Run locally (full stack with JWT API)**

   ```bash
   npm run backend   # Express API on PORT 5000 (set backend/.env with DATABASE_URL, JWT_SECRET)
   npm run dev       # Vite (proxies /api → localhost:5000)
   ```

   Production (Hostinger / one Node process): `npm run build && npm start` serves **static `dist/`** plus **`/api/*`** including JWT auth (`/api/auth/login`), quizzes, sessions, analytics, and admin. Set **`DATABASE_URL`** and **`JWT_SECRET`** in the host env.

   **Admin dashboard:** promote a user in Postgres (see `supabase/promote_user_to_admin.sql`), then sign in — **`/admin`** tabs: **Overview**, **Insights** (aptitude mix, quiz completions, AI usage, UTM), **Users**, **Sessions**, **Quizzes** (create drafts, questions, options, publish), **APIs** (OpenAI / Claude env status + runtime provider), **Settings** (SMTP note + UTM table). API keys stay in server env only. **Admins** can open **Parent dashboard** and see **all** children (same API as parents; previously returned Forbidden before deploy).

## Hostinger (Node / Git deploy)

In the panel, set:

- **Build command:** `npm run build`
- **Start command:** `npm start` (runs root `server.js`, which loads `server/index.js`)
- **Entry file:** If the panel asks for an entry point, use **`server.js`** (repo root) or leave default if it reads `package.json` → `"main": "server.js"`.
- **Environment variables:** `DATABASE_URL`, `JWT_SECRET` (required for login), `PUBLIC_APP_URL`, Brevo SMTP vars for forgot-password, `PORT` if the host does not inject it

Vite and Tailwind are in **dependencies** so `npm run build` still works if the platform skips devDependencies during install.

## Stack

- React 19, React Router, Tailwind CSS 4, Vite 8  
- Express (serves `dist/` + `/api`), `pg`, `dotenv`

## License

Private / coursework — adjust as needed.
