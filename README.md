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
   npm run build && npm start   # one process: API + static app (uses PORT, default 3001)
   npm run dev                  # Vite only (proxies /api → localhost:3001; run `npm run server` in another terminal)
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
