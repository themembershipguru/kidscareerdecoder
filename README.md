# KidsCareer Decoder

Full-stack aptitude quiz for kids: React (Vite) front end, Express API, and PostgreSQL via [Supabase](https://supabase.com).

## Setup

1. **Install**

   ```bash
   npm install
   ```

2. **Supabase** — In the SQL editor, run migrations in order:

   - `supabase/migrations/20250404000000_initial_schema.sql`
   - `supabase/migrations/20250411120000_users_birth_year.sql` (child birth year on the parent dashboard)

3. **Environment** — Copy `.env.example` to `.env` at the project root and set:

   - `DATABASE_URL` — Postgres URI from Supabase **Project Settings → Database → Connection string** (URI tab). Uses the **database password**, not the REST API keys.

4. **Usage** — Register a parent → **Add child** (copy the child’s sign-in email) → sign in as that child → complete the quiz → parent dashboard shows **live** sessions from the database.

5. **Run locally (full stack with JWT API)**

   ```bash
   npm run backend   # Express API on PORT 5000 (set backend/.env with DATABASE_URL, JWT_SECRET)
   npm run dev       # Vite (proxies /api → localhost:5000)
   ```

   Legacy single-process app (older `server/` + static):

   ```bash
   npm run build && npm start   # API + static (PORT 3001)
   ```

## Hostinger (Node / Git deploy)

In the panel, set:

- **Build command:** `npm run build`
- **Start command:** `npm start` (runs root `server.js`, which loads `server/index.js`)
- **Entry file:** If the panel asks for an entry point, use **`server.js`** (repo root) or leave default if it reads `package.json` → `"main": "server.js"`.
- **Environment variables:** `DATABASE_URL` (required), `PORT` if the host does not inject it

Vite and Tailwind are in **dependencies** so `npm run build` still works if the platform skips devDependencies during install.

## Stack

- React 19, React Router, Tailwind CSS 4, Vite 8  
- Express (serves `dist/` + `/api`), `pg`, `dotenv`

## License

Private / coursework — adjust as needed.
