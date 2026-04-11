import pkg from 'pg'

const { Pool } = pkg

let pool

export function getPool() {
  if (pool) return pool
  const connectionString = process.env.DATABASE_URL?.trim()
  if (!connectionString) {
    throw new Error(
      'Set DATABASE_URL to your Postgres connection string (Supabase → Project Settings → Database → Connection string → URI).',
    )
  }
  const useSsl =
    !connectionString.includes('localhost') && !connectionString.includes('127.0.0.1')
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
