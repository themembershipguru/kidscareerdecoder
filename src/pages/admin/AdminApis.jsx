import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, getApiError } from '../../utils/api.js'

const PROVIDERS = [
  { id: 'claude', label: 'Anthropic Claude' },
  { id: 'openai', label: 'OpenAI' },
  { id: 'random_forest', label: 'ML service (random_forest)' },
  { id: 'fallback_only', label: 'Fallback only (no external AI)' },
]

export function AdminApis() {
  const [ai, setAi] = useState(null)
  const [loadState, setLoadState] = useState('loading')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [pick, setPick] = useState('claude')

  const load = useCallback(async () => {
    setLoadState('loading')
    setError('')
    try {
      const { data } = await api.get('/admin/ai-status')
      setAi(data)
      setPick(data.effectiveProvider || 'claude')
      setLoadState('ready')
    } catch (err) {
      setError(getApiError(err))
      setLoadState('error')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function saveProvider() {
    setSaving(true)
    setError('')
    try {
      await api.patch('/admin/settings/ai-provider', { provider: pick })
      await load()
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setSaving(false)
    }
  }

  async function clearOverride() {
    setSaving(true)
    setError('')
    try {
      await api.delete('/admin/settings/ai-provider')
      await load()
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-extrabold text-slate-900">APIs &amp; AI</h1>
        <p className="mt-1 text-slate-600">
          OpenAI and Anthropic keys live only in your server environment (e.g.
          Hostinger). This page shows status and lets you override which provider
          runs at quiz completion.
        </p>

        {error && (
          <div className="mt-6 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            {error}
          </div>
        )}

        {loadState === 'loading' && (
          <p className="mt-8 text-slate-600">Loading…</p>
        )}

        {loadState === 'ready' && ai && (
          <>
            <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Anthropic (Claude)</h2>
              <p className="mt-2 text-sm text-slate-600">
                Create an API key in{' '}
                <a
                  href="https://console.anthropic.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-sky-600 underline"
                >
                  Anthropic Console
                </a>
                . Set on the server:
              </p>
              <code className="mt-3 block rounded-lg bg-slate-900 p-3 text-xs text-cyan-200">
                ANTHROPIC_API_KEY=sk-ant-api...
              </code>
              <p className="mt-3 text-sm font-semibold text-slate-800">
                Key loaded: {ai.anthropicKeyPresent ? 'Yes' : 'No'}
              </p>
            </section>

            <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">OpenAI</h2>
              <p className="mt-2 text-sm text-slate-600">
                Create a secret key in{' '}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-sky-600 underline"
                >
                  OpenAI Platform
                </a>
                . Set on the server:
              </p>
              <code className="mt-3 block rounded-lg bg-slate-900 p-3 text-xs text-cyan-200">
                OPENAI_API_KEY=sk-...
              </code>
              <p className="mt-3 text-sm font-semibold text-slate-800">
                Key loaded: {ai.openaiKeyPresent ? 'Yes' : 'No'}
              </p>
            </section>

            <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Environment defaults</h2>
              <p className="mt-2 text-sm text-slate-600">
                Default provider when no database override is set:
              </p>
              <code className="mt-3 block rounded-lg bg-slate-100 p-3 text-sm text-slate-800">
                AI_PROVIDER=claude
              </code>
              <p className="mt-2 text-xs text-slate-500">
                Other values: <code className="rounded bg-slate-200 px-1">openai</code>,{' '}
                <code className="rounded bg-slate-200 px-1">random_forest</code> (requires{' '}
                <code className="rounded bg-slate-200 px-1">ML_SERVICE_URL</code>).
              </p>
            </section>

            <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Runtime provider</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-600">Effective now</dt>
                  <dd className="font-mono font-bold text-slate-900">
                    {ai.effectiveProvider}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-600">From env</dt>
                  <dd className="font-mono text-slate-800">{ai.envDefault}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-600">DB override</dt>
                  <dd className="text-slate-800">{ai.dbOverride?.value ?? '(none)'}</dd>
                </div>
              </dl>

              <p className="mt-6 text-sm font-bold text-slate-700">
                Override (saved in database)
              </p>
              <div className="mt-3 space-y-2">
                {PROVIDERS.map((p) => (
                  <label
                    key={p.id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-100 px-3 py-2 hover:bg-slate-50"
                  >
                    <input
                      type="radio"
                      name="ai_provider"
                      value={p.id}
                      checked={pick === p.id}
                      onChange={() => setPick(p.id)}
                    />
                    <span className="text-sm text-slate-800">{p.label}</span>
                  </label>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void saveProvider()}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-cyan-300 disabled:opacity-60"
                >
                  Save provider
                </button>
                <button
                  type="button"
                  disabled={saving || !ai.dbOverride}
                  onClick={() => void clearOverride()}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-800 disabled:opacity-40"
                >
                  Clear override (use env only)
                </button>
              </div>
            </section>

            <p className="mt-8 text-sm text-slate-600">
              Charts and funnel metrics:{' '}
              <Link to="/admin/insights" className="font-semibold text-sky-600">
                Insights
              </Link>
              . Email (Brevo) for forgot-password: see{' '}
              <Link to="/admin/settings" className="font-semibold text-sky-600">
                Settings
              </Link>
              .
            </p>
          </>
        )}
      </div>
    </div>
  )
}
