import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, getApiError } from '../../utils/api.js'

export function AdminSettings() {
  const [breakdown, setBreakdown] = useState([])
  const [loadState, setLoadState] = useState('loading')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoadState('loading')
    setError('')
    try {
      const { data } = await api.get('/admin/analytics/attribution')
      setBreakdown(data.breakdown ?? [])
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
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-extrabold text-slate-900">Settings</h1>
        <p className="mt-1 text-slate-600">
          Marketing attribution and operational notes. OpenAI / Claude keys and
          provider switching are under{' '}
          <Link to="/admin/apis" className="font-semibold text-sky-600">
            APIs &amp; AI
          </Link>
          .
        </p>

        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <p className="font-bold">Forgot password email (Brevo SMTP)</p>
          <p className="mt-1">
            Set <code className="rounded bg-white/80 px-1">SMTP_*</code>,{' '}
            <code className="rounded bg-white/80 px-1">MAIL_FROM</code>, and{' '}
            <code className="rounded bg-white/80 px-1">PUBLIC_APP_URL</code> on
            the server. See <code className="rounded bg-white/80 px-1">.env.example</code>.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            {error}
          </div>
        )}

        {loadState === 'loading' && (
          <p className="mt-8 text-slate-600">Loading…</p>
        )}

        {loadState === 'ready' && (
          <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Signup attribution (UTM)
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Grouped by utm_source and utm_medium from parent registrations. A
              fuller view is on{' '}
              <Link to="/admin/insights" className="font-semibold text-sky-600">
                Insights
              </Link>
              .
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
        )}
      </div>
    </div>
  )
}
