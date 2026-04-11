import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { aptitudeOrder } from '../../lib/quizScoring.js'
import { api, getApiError } from '../../utils/api.js'

const barColors = {
  logical: 'bg-sky-400',
  creative: 'bg-fuchsia-400',
  verbal: 'bg-amber-400',
  social: 'bg-rose-400',
  scientific: 'bg-emerald-400',
  practical: 'bg-orange-400',
}

function formatWhen(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString()
}

function normalizeScores(raw) {
  if (!raw) return {}
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw)
    } catch {
      return {}
    }
  }
  return raw
}

export function AdminSessionDetail() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [loadState, setLoadState] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoadState('loading')
      setError('')
      try {
        const { data } = await api.get(`/admin/sessions/${sessionId}`)
        if (cancelled) return
        setSession(data)
        setLoadState('ready')
      } catch (err) {
        if (!cancelled) {
          setError(getApiError(err))
          setLoadState('error')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [sessionId])

  const scores = useMemo(() => normalizeScores(session?.scores_json), [session])
  const meta = session?.metadata_json

  if (loadState === 'loading') {
    return (
      <div className="px-4 py-10 text-center text-slate-600">Loading…</div>
    )
  }
  if (loadState === 'error' || !session) {
    return (
      <div className="px-4 py-10">
        <p className="text-rose-700">{error || 'Not found'}</p>
        <Link to="/admin/sessions" className="mt-4 inline-block text-sky-600">
          Back to sessions
        </Link>
      </div>
    )
  }

  return (
    <div className="px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm font-semibold text-sky-600 hover:underline"
        >
          ← Back
        </button>

        <h1 className="mt-4 text-3xl font-extrabold text-slate-900">Session</h1>
        <p className="text-sm text-slate-600">
          {session.quiz_title} · {session.user_name} ·{' '}
          <span className="font-mono text-xs">{session.id}</span>
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Started {formatWhen(session.started_at)}
          {session.completed_at && (
            <> · Completed {formatWhen(session.completed_at)}</>
          )}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold uppercase">
            {session.status}
          </span>
          {session.top_aptitude && (
            <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold text-cyan-900">
              Top: {session.top_aptitude}
            </span>
          )}
          {meta?.ai_provider && (
            <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-900">
              AI: {meta.ai_provider}
            </span>
          )}
        </div>

        {session.attribution_json &&
          Object.keys(session.attribution_json).length > 0 && (
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="font-bold text-slate-800">Session attribution</p>
              <pre className="mt-2 overflow-x-auto rounded bg-slate-50 p-3 text-xs">
                {JSON.stringify(session.attribution_json, null, 2)}
              </pre>
            </div>
          )}

        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Scores</h2>
          <ul className="mt-4 space-y-3">
            {aptitudeOrder.map((key) => {
              const val = Number(scores[key] ?? 0)
              const pct = Math.min(100, Math.max(0, val))
              return (
                <li key={key}>
                  <div className="flex justify-between text-sm font-semibold text-slate-800">
                    <span className="capitalize">{key}</span>
                    <span>{val}%</span>
                  </div>
                  <div className="mt-1 h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${barColors[key] ?? 'bg-slate-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">AI insights</h2>
          {meta ? (
            <dl className="mt-4 space-y-3 text-sm">
              {meta.profile != null && (
                <div>
                  <dt className="font-bold text-slate-600">Profile</dt>
                  <dd className="mt-1 text-slate-900">{String(meta.profile)}</dd>
                </div>
              )}
              {meta.top_strength != null && (
                <div>
                  <dt className="font-bold text-slate-600">Top strength</dt>
                  <dd className="mt-1 text-slate-900">{String(meta.top_strength)}</dd>
                </div>
              )}
              {meta.explanation != null && (
                <div>
                  <dt className="font-bold text-slate-600">Explanation</dt>
                  <dd className="mt-1 whitespace-pre-wrap text-slate-800">
                    {String(meta.explanation)}
                  </dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="mt-2 text-slate-500">No metadata stored.</p>
          )}
        </section>

        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Answers</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-3 py-2 font-bold text-slate-700">Time</th>
                  <th className="px-3 py-2 font-bold text-slate-700">Question</th>
                  <th className="px-3 py-2 font-bold text-slate-700">Choice</th>
                  <th className="px-3 py-2 font-bold text-slate-700">Aptitude</th>
                </tr>
              </thead>
              <tbody>
                {(session.answers ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-slate-500">
                      No answers recorded.
                    </td>
                  </tr>
                ) : (
                  session.answers.map((a) => (
                    <tr key={a.id} className="border-b border-slate-100">
                      <td className="px-3 py-2 text-xs text-slate-500">
                        {formatWhen(a.answered_at)}
                      </td>
                      <td className="max-w-md px-3 py-2 text-slate-800">
                        {a.skipped ? (
                          <span className="italic text-slate-400">Skipped</span>
                        ) : (
                          a.question_body
                        )}
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {a.skipped ? '—' : (a.option_label ?? '—')}
                      </td>
                      <td className="px-3 py-2 capitalize text-slate-600">
                        {a.aptitude_type ?? '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
