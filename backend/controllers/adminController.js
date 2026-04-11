import { getPool } from '../db/pool.js'

export async function getAdminSummary(req, res) {
  try {
    const pool = getPool()
    const [
      totalUsers,
      parentCount,
      childCount,
      completedSessions,
      recentSessions,
      recentUsers,
    ] = await Promise.all([
      pool.query(`SELECT COUNT(*)::int AS n FROM public.users`),
      pool.query(
        `SELECT COUNT(*)::int AS n FROM public.users WHERE role = 'parent'`,
      ),
      pool.query(
        `SELECT COUNT(*)::int AS n FROM public.users WHERE role = 'child'`,
      ),
      pool.query(
        `SELECT COUNT(*)::int AS n FROM public.quiz_sessions WHERE status = 'completed'`,
      ),
      pool.query(
        `SELECT qs.id AS session_id,
                qs.completed_at,
                qs.started_at,
                qs.top_aptitude,
                qs.status,
                u.full_name AS child_name,
                u.email::text AS child_email,
                q.title AS quiz_title,
                q.slug AS quiz_slug
         FROM public.quiz_sessions qs
         JOIN public.users u ON u.id = qs.user_id
         JOIN public.quizzes q ON q.id = qs.quiz_id
         ORDER BY qs.completed_at DESC NULLS LAST
         LIMIT 40`,
      ),
      pool.query(
        `SELECT id, email::text AS email, full_name, role, parent_user_id, created_at
         FROM public.users
         ORDER BY created_at DESC
         LIMIT 80`,
      ),
    ])
    res.json({
      stats: {
        totalUsers: totalUsers.rows[0]?.n ?? 0,
        parentCount: parentCount.rows[0]?.n ?? 0,
        childCount: childCount.rows[0]?.n ?? 0,
        completedSessions: completedSessions.rows[0]?.n ?? 0,
      },
      recentSessions: recentSessions.rows,
      recentUsers: recentUsers.rows,
    })
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Server error',
    })
  }
}
