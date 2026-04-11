# KidsCareer Decoder

Full-stack aptitude quiz for kids: React (Vite) front end, Express API, and PostgreSQL via [Supabase](https://supabase.com).

## Setup

1. **Install**

   ```bash
   npm install
   ```

2. **Supabase** — In the Supabase SQL editor, run `supabase/migrations/20250404000000_initial_schema.sql`.

3. **Environment** — Copy `.env.example` to `.env` at the project root and set:

   - `DATABASE_URL` — Postgres URI from Supabase **Project Settings → Database → Connection string** (URI tab). Uses the **database password**, not the REST API keys.

4. **Run locally**

   ```bash
   npm run server   # API → http://localhost:3001
   npm run dev      # App → http://localhost:5173 (proxies /api to the server)
   ```

## Stack

- React 19, React Router, Tailwind CSS 4  
- Express, `pg` (direct Postgres), `dotenv`

## License

Private / coursework — adjust as needed.
