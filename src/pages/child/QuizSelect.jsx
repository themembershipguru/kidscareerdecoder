import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context'
import { api, getApiError } from '../../utils/api.js'

export function QuizSelect() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [quizzes, setQuizzes] = useState([])
  const [loadState, setLoadState] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoadState('loading')
      setError('')
      try {
        const { data } = await api.get('/quiz')
        if (cancelled) return
        setQuizzes(Array.isArray(data) ? data : [])
        setLoadState('ready')
      } catch (err) {
        if (cancelled) return
        setError(getApiError(err))
        setLoadState('error')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function startQuiz(q) {
    if (!user?.id) return
    try {
      const { data } = await api.post('/session/start', {
        quiz_id: q.id,
        user_id: user.id,
      })
      navigate(`/child/quiz/${q.slug}`, {
        state: { sessionId: data.session_id },
      })
    } catch (err) {
      setError(getApiError(err))
    }
  }

  const estMinutes = (q) => {
    const n = 20
    const sec = q.time_per_question_seconds ?? 60
    return Math.max(1, Math.round((n * sec) / 60))
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold text-[#1A1A2E]">Pick a quiz</h1>
      <p className="mt-2 text-[#1A1A2E]/70">
        Choose a fun scenario quiz. There are no wrong answers.
      </p>

      {loadState === 'loading' && (
        <p className="mt-8 text-center font-medium text-[#1A1A2E]/65">Loading…</p>
      )}

      {loadState === 'error' && (
        <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
          <p className="font-semibold">{error}</p>
          <p className="mt-2 text-sm">
            Run <code className="rounded bg-white px-1">npm run backend</code> and
            check <code className="rounded bg-white px-1">DATABASE_URL</code>.
          </p>
        </div>
      )}

      {loadState === 'ready' && quizzes.length === 0 && (
        <p className="mt-8 rounded-2xl border border-dashed border-[#1A1A2E]/20 bg-white p-8 text-center text-[#1A1A2E]/70">
          No published quizzes yet. Ask a grown-up to publish one in the
          database.
        </p>
      )}

      {loadState === 'ready' && quizzes.length > 0 && (
        <ul className="mt-8 flex flex-col gap-6">
          {quizzes.map((q) => (
            <li key={q.id}>
              <button
                type="button"
                onClick={() => void startQuiz(q)}
                className="w-full rounded-3xl border border-[#1A1A2E]/10 bg-white p-6 text-left shadow-lg shadow-[#1A1A2E]/5 transition hover:border-[#00D4FF]/40 hover:shadow-xl"
              >
                <h2 className="text-xl font-bold text-[#1A1A2E]">{q.title}</h2>
                {q.description && (
                  <p className="mt-2 text-sm leading-relaxed text-[#1A1A2E]/70">
                    {q.description}
                  </p>
                )}
                <p className="mt-4 text-sm font-semibold text-[#00D4FF]">
                  About {estMinutes(q)} min · tap to start
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
