import bcrypt from 'bcryptjs'
import { getPool } from '../db/pool.js'

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

function parsePage(raw) {
  const n = Number.parseInt(String(raw ?? '1'), 10)
  return Number.isFinite(n) && n >= 1 ? n : 1
}

function parseLimit(raw) {
  const n = Number.parseInt(String(raw ?? DEFAULT_LIMIT), 10)
  if (!Number.isFinite(n) || n < 1) return DEFAULT_LIMIT
  return Math.min(n, MAX_LIMIT)
}

export async function listAdminUsers(req, res) {
  try {
    const pool = getPool()
    const page = parsePage(req.query.page)
    const limit = parseLimit(req.query.limit)
    const offset = (page - 1) * limit
    const role = req.query.role ? String(req.query.role).trim() : null
    const search = req.query.search ? String(req.query.search).trim() : null
    const utmSource = req.query.utm_source ? String(req.query.utm_source).trim() : null

    const conditions = []
    const params = []
    let i = 1

    if (role && ['parent', 'child', 'admin'].includes(role)) {
      conditions.push(`u.role = $${i++}`)
      params.push(role)
    }
    if (search) {
      conditions.push(
        `(u.full_name ILIKE $${i} OR u.email::text ILIKE $${i})`,
      )
      params.push(`%${search}%`)
      i += 1
    }
    if (utmSource) {
      conditions.push(`u.attribution_json->>'utm_source' = $${i++}`)
      params.push(utmSource)
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const countRes = await pool.query(
      `SELECT COUNT(*)::int AS n FROM public.users u ${where}`,
      params,
    )
    const total = countRes.rows[0]?.n ?? 0

    params.push(limit, offset)
    const limIdx = i
    const offIdx = i + 1

    const { rows } = await pool.query(
      `SELECT u.id, u.email::text AS email, u.full_name, u.role, u.parent_user_id,
              u.date_of_birth, u.birth_year, u.created_at, u.updated_at, u.attribution_json
       FROM public.users u
       ${where}
       ORDER BY u.created_at DESC
       LIMIT $${limIdx} OFFSET $${offIdx}`,
      params,
    )

    res.json({
      users: rows,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    })
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Server error',
    })
  }
}

export async function getAdminUser(req, res) {
  try {
    const id = String(req.params.id || '')
    const pool = getPool()
    const { rows } = await pool.query(
      `SELECT id, email::text AS email, full_name, role, parent_user_id,
              date_of_birth, birth_year, created_at, updated_at, attribution_json
       FROM public.users WHERE id = $1 LIMIT 1`,
      [id],
    )
    const user = rows[0]
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }
    const sessRes = await pool.query(
      `SELECT COUNT(*)::int AS n FROM public.quiz_sessions WHERE user_id = $1`,
      [id],
    )
    res.json({
      ...user,
      session_count: sessRes.rows[0]?.n ?? 0,
    })
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Server error',
    })
  }
}

async function countAdmins(pool) {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS n FROM public.users WHERE role = 'admin'`,
  )
  return rows[0]?.n ?? 0
}

export async function patchAdminUser(req, res) {
  try {
    const id = String(req.params.id || '')
    const pool = getPool()
    const { rows: existingRows } = await pool.query(
      `SELECT id, email, role FROM public.users WHERE id = $1 LIMIT 1`,
      [id],
    )
    const existing = existingRows[0]
    if (!existing) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const body = req.body && typeof req.body === 'object' ? req.body : {}
    const updates = []
    const values = []
    let p = 1

    if (body.full_name != null) {
      const v = String(body.full_name).trim()
      if (!v) {
        res.status(400).json({ error: 'full_name cannot be empty' })
        return
      }
      updates.push(`full_name = $${p++}`)
      values.push(v)
    }

    if (body.email != null) {
      const email = String(body.email).trim().toLowerCase()
      if (!email) {
        res.status(400).json({ error: 'email cannot be empty' })
        return
      }
      const taken = await pool.query(
        `SELECT id FROM public.users WHERE email = $1::citext AND id <> $2 LIMIT 1`,
        [email, id],
      )
      if (taken.rows.length) {
        res.status(409).json({ error: 'Email already in use' })
        return
      }
      updates.push(`email = $${p++}::citext`)
      values.push(email)
    }

    if (body.role != null) {
      const newRole = String(body.role).trim()
      if (!['parent', 'child', 'admin'].includes(newRole)) {
        res.status(400).json({ error: 'Invalid role' })
        return
      }
      if (existing.role === 'admin' && newRole !== 'admin') {
        const admins = await countAdmins(pool)
        if (admins <= 1) {
          res.status(400).json({ error: 'Cannot remove the last admin' })
          return
        }
      }
      updates.push(`role = $${p++}`)
      values.push(newRole)
    }

    if (body.parent_user_id !== undefined) {
      const pid = body.parent_user_id
      if (pid === null || pid === '') {
        updates.push(`parent_user_id = NULL`)
      } else {
        const pr = await pool.query(
          `SELECT id, role FROM public.users WHERE id = $1 LIMIT 1`,
          [String(pid)],
        )
        const parent = pr.rows[0]
        if (!parent || !['parent', 'admin'].includes(parent.role)) {
          res.status(400).json({ error: 'parent_user_id must reference a parent or admin user' })
          return
        }
        updates.push(`parent_user_id = $${p++}`)
        values.push(String(pid))
      }
    }

    if (body.date_of_birth !== undefined) {
      if (body.date_of_birth === null || body.date_of_birth === '') {
        updates.push(`date_of_birth = NULL`)
      } else {
        const d = new Date(String(body.date_of_birth))
        if (Number.isNaN(d.getTime())) {
          res.status(400).json({ error: 'Invalid date_of_birth' })
          return
        }
        updates.push(`date_of_birth = $${p++}::date`)
        values.push(String(body.date_of_birth).slice(0, 10))
      }
    }

    if (body.birth_year !== undefined) {
      if (body.birth_year === null || body.birth_year === '') {
        updates.push(`birth_year = NULL`)
      } else {
        const y = Number(body.birth_year)
        if (!Number.isFinite(y) || y < 1900 || y > 2100) {
          res.status(400).json({ error: 'Invalid birth_year' })
          return
        }
        updates.push(`birth_year = $${p++}`)
        values.push(y)
      }
    }

    if (body.password != null && String(body.password).length > 0) {
      if (existing.role !== 'parent' && existing.role !== 'admin') {
        res.status(400).json({ error: 'Password reset only for parent or admin accounts' })
        return
      }
      const pwd = String(body.password)
      if (pwd.length < 8) {
        res.status(400).json({ error: 'Password must be at least 8 characters' })
        return
      }
      const hash = await bcrypt.hash(pwd, 10)
      updates.push(`password_hash = $${p++}`)
      values.push(hash)
    }

    if (updates.length === 0) {
      res.status(400).json({ error: 'No valid fields to update' })
      return
    }

    updates.push(`updated_at = now()`)
    values.push(id)

    await pool.query(
      `UPDATE public.users SET ${updates.join(', ')} WHERE id = $${p}`,
      values,
    )

    const { rows } = await pool.query(
      `SELECT id, email::text AS email, full_name, role, parent_user_id,
              date_of_birth, birth_year, created_at, updated_at, attribution_json
       FROM public.users WHERE id = $1 LIMIT 1`,
      [id],
    )
    res.json(rows[0])
  } catch (err) {
    if (err && typeof err === 'object' && 'code' in err && err.code === '23505') {
      res.status(409).json({ error: 'Email already in use' })
      return
    }
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Server error',
    })
  }
}
