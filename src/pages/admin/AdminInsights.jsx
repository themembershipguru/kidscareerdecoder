import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, getApiError } from '../../utils/api.js'

export function AdminInsights() {
  const [insights, setInsights] = useState(null)
  const [breakdown, setBreakdown] = useState([])
  const [loadState, setLoadState] = useState('loading')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoadState('loading')
    setError('')
    try {
      const [insRes, attRes] = await Promise.all([
        api.get('/admin/insights'),
        api.get('/admin/analytics/attribution'),
      ])
      setInsights(insRes.data)
      setBreakdown(attRes.data.breakdown ?? [])
      setLoadState('ready')
    } catch (err) {
      setError(getApiError(err))
      setLoadState('error')
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch
    void load()
  }, [load])

  return (
    <div className="px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Insights</h1>
            <p className="mt-1 text-slate-600">
              Quiz completions, aptitude mix, AI provider usage, and marketing
              signups.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-cyan-300 transition hover:bg-slate-800"
          >
            Refresh
          </button>
        </div>

        {loadState === 'loading' && (
          <p className="mt-10 text-center text-slate-600">Loading…</p>
        )}
        {loadState === 'error' && (
          <div className="mt-8 rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
            {error}
          </div>
        )}

        {loadState === 'ready' && insights && (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                ['Completed (7 days)', insights.completedLast7Days],
                ['Completed (30 days)', insights.completedLast30Days],
                ['In progress now', insights.sessionsInProgress],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <p className="text-sm font-semibold text-slate-500">{label}</p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-900">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10 grid gap-8 lg:grid-cols-2">
              <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900">
                  Top aptitude (completed sessions)
                </h2>
                <ul className="mt-4 space-y-2 text-sm">
                  {(insights.topAptitude ?? []).length === 0 ? (
                    <li className="text-slate-500">No data yet.</li>
                  ) : (
                    insights.topAptitude.map((row) => (
                      <li
                        key={row.top_aptitude}
                        className="flex justify-between border-b border-slate-100 py-2"
                      >
                        <span className="capitalize text-slate-800">
                          {row.top_aptitude}
                        </span>
                        <span className="font-bold text-slate-900">{row.n}</span>
                      </li>
                    ))
                  )}
                </ul>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900">
                  AI provider (stored on session)
                </h2>
                <ul className="mt-4 space-y-2 text-sm">
                  {(insights.aiProviderUsage ?? []).length === 0 ? (
                    <li className="text-slate-500">No completed sessions yet.</li>
                  ) : (
                    insights.aiProviderUsage.map((row) => (
                      <li
                        key={row.provider}
                        className="flex justify-between border-b border-slate-100 py-2"
                      >
                        <span className="font-mono text-slate-800">
                          {row.provider}
                        </span>
                        <span className="font-bold text-slate-900">{row.n}</span>
                      </li>
                    ))
                  )}
                </ul>
                <p className="mt-4 text-xs text-slate-500">
                  Configure keys and runtime provider under{' '}
                  <Link to="/admin/apis" className="font-semibold text-sky-600">
                    APIs
                  </Link>
                  .
                </p>
              </section>
            </div>

            <section className="mt-10 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Quiz completions</h2>
              <p className="mt-1 text-sm text-slate-600">
                Per quiz title (all time). Edit quizzes in{' '}
                <Link to="/admin/quizzes" className="font-semibold text-sky-600">
                  Quizzes
                </Link>
                .
              </p>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 font-bold text-slate-700">Quiz</th>
                      <th className="px-4 py-3 font-bold text-slate-700">Published</th>
                      <th className="px-4 py-3 font-bold text-slate-700">
                        Completions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(insights.completionsByQuiz ?? []).map((q) => (
                      <tr key={q.id} className="border-b border-slate-100">
                        <td className="px-4 py-3">
                          <Link
                            to={`/admin/quizzes/${q.id}`}
                            className="font-medium text-sky-700 hover:underline"
                          >
                            {q.title}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {q.is_published ? 'Yes' : 'Draft'}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {q.completions}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-10 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">
                Signup attribution (UTM)
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Parent registrations by source and medium.
              </p>
              {breakdown.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">No attribution data yet.</p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50">
                      <tr>
                        <th className="px-3 py-2 font-bold text-slate-700">Source</th>
                        <th className="px-3 py-2 font-bold text-slate-700">Medium</th>
                        <th className="px-3 py-2 font-bold text-slate-700">Signups</th>
                      </tr>
                    </thead>
                    <tbody>
                      {breakdown.map((row, i) => (
                        <tr key={i} className="border-b border-slate-100">
                          <td className="px-3 py-2">{row.utm_source}</td>
                          <td className="px-3 py-2">{row.utm_medium}</td>
                          <td className="px-3 py-2 font-semibold">{row.signups}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}
