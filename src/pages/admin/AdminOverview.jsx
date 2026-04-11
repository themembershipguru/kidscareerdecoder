import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, getApiError } from '../../utils/api.js'

function formatWhen(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString()
}

export function AdminOverview() {
  const [data, setData] = useState(null)
  const [loadState, setLoadState] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoadState('loading')
      setError('')
      try {
        const { data: body } = await api.get('/admin/summary')
        if (cancelled) return
        setData(body)
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

  async function reload() {
    setLoadState('loading')
    setError('')
    try {
      const { data: body } = await api.get('/admin/summary')
      setData(body)
      setLoadState('ready')
    } catch (err) {
      setError(getApiError(err))
      setLoadState('error')
    }
  }

  return (
    <div className="px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">
              Platform overview
            </h1>
            <p className="mt-1 text-slate-600">
              Users and completed quiz sessions across the database.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void reload()}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-cyan-300 transition hover:bg-slate-800"
            >
              Refresh
            </button>
            <Link
              to="/parent/dashboard"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
            >
              Parent dashboard
            </Link>
          </div>
        </div>

        {loadState === 'loading' && (
          <p className="mt-10 text-center font-medium text-slate-600">Loading…</p>
        )}

        {loadState === 'error' && (
          <div className="mt-8 rounded-xl border border-rose-200 bg-rose-50 p-6">
            <p className="font-semibold text-rose-900">{error}</p>
          </div>
        )}

        {loadState === 'ready' && data && (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Total users', data.stats.totalUsers],
                ['Parents', data.stats.parentCount],
                ['Children', data.stats.childCount],
                ['Completed quizzes', data.stats.completedSessions],
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

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-sky-200 bg-sky-50/80 p-5">
                <h3 className="font-bold text-slate-900">Add or edit quizzes</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Open <strong>Quizzes</strong>, type a title, click{' '}
                  <strong>Create draft</strong>, then add questions and answer
                  options. Turn on <strong>Published</strong> when each question
                  has at least one option.
                </p>
                <Link
                  to="/admin/quizzes"
                  className="mt-3 inline-block text-sm font-bold text-sky-700 hover:underline"
                >
                  Go to Quizzes →
                </Link>
              </div>
              <div className="rounded-2xl border border-violet-200 bg-violet-50/80 p-5">
                <h3 className="font-bold text-slate-900">Insights</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Aptitude distribution, completions per quiz, AI provider usage,
                  and UTM signups.
                </p>
                <Link
                  to="/admin/insights"
                  className="mt-3 inline-block text-sm font-bold text-violet-800 hover:underline"
                >
                  Open Insights →
                </Link>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5">
                <h3 className="font-bold text-slate-900">OpenAI &amp; Claude</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Set API keys on the server, then choose the runtime provider
                  (or use database override).
                </p>
                <Link
                  to="/admin/apis"
                  className="mt-3 inline-block text-sm font-bold text-emerald-800 hover:underline"
                >
                  APIs &amp; AI →
                </Link>
              </div>
            </div>

            <section className="mt-10">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-slate-900">
                  Recent completed sessions
                </h2>
                <Link
                  to="/admin/sessions"
                  className="text-sm font-semibold text-sky-600 hover:underline"
                >
                  View all
                </Link>
              </div>
              <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 font-bold text-slate-700">When</th>
                      <th className="px-4 py-3 font-bold text-slate-700">Child</th>
                      <th className="px-4 py-3 font-bold text-slate-700">Quiz</th>
                      <th className="px-4 py-3 font-bold text-slate-700">Top</th>
                      <th className="px-4 py-3 font-bold text-slate-700">AI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.recentSessions ?? []).length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-6 text-center text-slate-500"
                        >
                          No completed sessions yet.
                        </td>
                      </tr>
                    ) : (
                      data.recentSessions.map((s) => (
                        <tr
                          key={s.session_id}
                          className="border-b border-slate-100"
                        >
                          <td className="px-4 py-3 text-slate-800">
                            <Link
                              to={`/admin/sessions/${s.session_id}`}
                              className="font-medium text-sky-700 hover:underline"
                            >
                              {formatWhen(s.completed_at)}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-slate-800">
                            <span className="font-medium">{s.child_name}</span>
                            <span className="mt-0.5 block break-all text-xs text-slate-500">
                              {s.child_email}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-800">
                            {s.quiz_title}
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-900">
                            {s.top_aptitude ?? '—'}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {s.ai_provider ?? '—'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-10">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-slate-900">Recent users</h2>
                <Link
                  to="/admin/users"
                  className="text-sm font-semibold text-sky-600 hover:underline"
                >
                  View all
                </Link>
              </div>
              <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 font-bold text-slate-700">Created</th>
                      <th className="px-4 py-3 font-bold text-slate-700">Name</th>
                      <th className="px-4 py-3 font-bold text-slate-700">Email</th>
                      <th className="px-4 py-3 font-bold text-slate-700">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.recentUsers ?? []).map((u) => (
                      <tr key={u.id} className="border-b border-slate-100">
                        <td className="px-4 py-3 text-slate-600">
                          {formatWhen(u.created_at)}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900">
                          <Link
                            to={`/admin/users/${u.id}`}
                            className="text-sky-700 hover:underline"
                          >
                            {u.full_name}
                          </Link>
                        </td>
                        <td className="break-all px-4 py-3 text-slate-700">
                          {u.email}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-bold uppercase text-slate-800">
                            {u.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}
