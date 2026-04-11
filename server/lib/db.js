import pkg from 'pg'

const { Pool } = pkg

let pool

/**
 * Direct Postgres connection (Supabase: Dashboard → Project Settings → Database → URI).
 * Uses the database password, not the API service_role JWT.
 */
export function getPool() {
  if (pool) return pool
  const connectionString = process.env.DATABASE_URL
  if (!connectionString?.trim()) {
    throw new Error(
      'Set DATABASE_URL to your Postgres connection string (e.g. from Supabase → Database → Connection string, URI tab).',
    )
  }
  const useSsl =
    !connectionString.includes('localhost') &&
    !connectionString.includes('127.0.0.1')
  pool = new Pool({
    connectionString,
    max: 10,
    ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
  })
  return pool
}

export async function closePool() {
  if (pool) {
    await pool.end()
    pool = null
  }
}
