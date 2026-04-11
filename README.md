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

   **Quick fix** if only `date_of_birth` is missing — paste and run:

   ```sql
   ALTER TABLE public.users
     ADD COLUMN IF NOT EXISTS date_of_birth date;
   ```

3. **Environment** — Copy `.env.example` to `.env` at the project root and set:

   - `DATABASE_URL` — Postgres URI from Supabase **Project Settings → Database → Connection string** (URI tab). Uses the **database password**, not the REST API keys.
   - `JWT_SECRET` — Required for login (`/api/auth/login`). Set a long random string on Hostinger and locally or auth returns 500.

4. **Usage** — Register a parent → **Add child** (copy the child’s sign-in email) → sign in as that child → complete the quiz → parent dashboard shows **live** sessions from the database.

5. **Run locally (full stack with JWT API)**

   ```bash
   npm run backend   # Express API on PORT 5000 (set backend/.env with DATABASE_URL, JWT_SECRET)
   npm run dev       # Vite (proxies /api → localhost:5000)
   ```

   Production (Hostinger / one Node process): `npm run build && npm start` serves **static `dist/`** plus **`/api/*`** including JWT auth (`/api/auth/login`), quizzes, sessions, analytics, and admin. Set **`DATABASE_URL`** and **`JWT_SECRET`** in the host env.

   **Admin dashboard:** promote a user in Postgres (see `supabase/promote_user_to_admin.sql`), then sign in with that account — **`/admin`** shows users and recent sessions. Admins can still open the parent dashboard from the header.

## Hostinger (Node / Git deploy)

In the panel, set:

- **Build command:** `npm run build`
- **Start command:** `npm start` (runs root `server.js`, which loads `server/index.js`)
- **Entry file:** If the panel asks for an entry point, use **`server.js`** (repo root) or leave default if it reads `package.json` → `"main": "server.js"`.
- **Environment variables:** `DATABASE_URL`, `JWT_SECRET` (required for login), `PORT` if the host does not inject it

Vite and Tailwind are in **dependencies** so `npm run build` still works if the platform skips devDependencies during install.

## Stack

- React 19, React Router, Tailwind CSS 4, Vite 8  
- Express (serves `dist/` + `/api`), `pg`, `dotenv`

## License

Private / coursework — adjust as needed.
