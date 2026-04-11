import { getPool } from '../db/pool.js'

export async function getAdminInsights(_req, res) {
  try {
    const pool = getPool()
    const [
      topAptitude,
      completionsByQuiz,
      aiProviderUsage,
      last7,
      last30,
      inProgress,
    ] = await Promise.all([
      pool.query(
        `SELECT top_aptitude, COUNT(*)::int AS n
         FROM public.quiz_sessions
         WHERE status = 'completed' AND top_aptitude IS NOT NULL
         GROUP BY top_aptitude
         ORDER BY n DESC`,
      ),
      pool.query(
        `SELECT q.id, q.title, q.is_published,
                COUNT(qs.id) FILTER (WHERE qs.status = 'completed')::int AS completions
         FROM public.quizzes q
         LEFT JOIN public.quiz_sessions qs ON qs.quiz_id = q.id
         GROUP BY q.id, q.title, q.is_published
         ORDER BY completions DESC, q.title ASC`,
      ),
      pool.query(
        `SELECT COALESCE(metadata_json->>'ai_provider', '(unknown)') AS provider,
                COUNT(*)::int AS n
         FROM public.quiz_sessions
         WHERE status = 'completed'
         GROUP BY 1
         ORDER BY n DESC`,
      ),
      pool.query(
        `SELECT COUNT(*)::int AS n FROM public.quiz_sessions
         WHERE status = 'completed' AND completed_at >= now() - interval '7 days'`,
      ),
      pool.query(
        `SELECT COUNT(*)::int AS n FROM public.quiz_sessions
         WHERE status = 'completed' AND completed_at >= now() - interval '30 days'`,
      ),
      pool.query(
        `SELECT COUNT(*)::int AS n FROM public.quiz_sessions WHERE status = 'in_progress'`,
      ),
    ])

    res.json({
      topAptitude: topAptitude.rows,
      completionsByQuiz: completionsByQuiz.rows,
      aiProviderUsage: aiProviderUsage.rows,
      completedLast7Days: last7.rows[0]?.n ?? 0,
      completedLast30Days: last30.rows[0]?.n ?? 0,
      sessionsInProgress: inProgress.rows[0]?.n ?? 0,
    })
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Server error',
    })
  }
}
