import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, getApiError } from '../../utils/api.js'

function formatWhen(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString()
}

export function AdminUserDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loadState, setLoadState] = useState('loading')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    role: 'parent',
    parent_user_id: '',
    date_of_birth: '',
    birth_year: '',
    password: '',
  })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoadState('loading')
      setError('')
      try {
        const { data } = await api.get(`/admin/users/${id}`)
        if (cancelled) return
        setUser(data)
        setForm({
          full_name: data.full_name ?? '',
          email: data.email ?? '',
          role: data.role ?? 'parent',
          parent_user_id: data.parent_user_id ?? '',
          date_of_birth: data.date_of_birth
            ? String(data.date_of_birth).slice(0, 10)
            : '',
          birth_year: data.birth_year != null ? String(data.birth_year) : '',
          password: '',
        })
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
  }, [id])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        role: form.role,
        parent_user_id: form.parent_user_id.trim() || null,
        date_of_birth: form.date_of_birth || null,
        birth_year: form.birth_year ? Number(form.birth_year) : null,
      }
      if (form.password.trim()) {
        payload.password = form.password
      }
      const { data } = await api.patch(`/admin/users/${id}`, payload)
      setUser((u) => ({
        ...u,
        ...data,
        session_count: u.session_count,
      }))
      setForm((f) => ({ ...f, password: '' }))
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setSaving(false)
    }
  }

  if (loadState === 'loading') {
    return (
      <div className="px-4 py-10 text-center text-slate-600">Loading…</div>
    )
  }
  if (loadState === 'error' || !user) {
    return (
      <div className="px-4 py-10">
        <p className="text-rose-700">{error || 'Not found'}</p>
        <Link to="/admin/users" className="mt-4 inline-block text-sky-600">
          Back to users
        </Link>
      </div>
    )
  }

  return (
    <div className="px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-2xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm font-semibold text-sky-600 hover:underline"
        >
          ← Back
        </button>
        <h1 className="mt-4 text-3xl font-extrabold text-slate-900">
          {user.full_name}
        </h1>
        <p className="text-sm text-slate-500">
          Created {formatWhen(user.created_at)} · {user.session_count ?? 0} quiz
          sessions
        </p>

        {user.attribution_json &&
          Object.keys(user.attribution_json).length > 0 && (
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
              <p className="font-bold text-slate-800">Attribution</p>
              <pre className="mt-2 overflow-x-auto rounded bg-slate-50 p-3 text-xs text-slate-700">
                {JSON.stringify(user.attribution_json, null, 2)}
              </pre>
            </div>
          )}

        <form
          onSubmit={(e) => void handleSave(e)}
          className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          {error && (
            <p className="text-sm font-medium text-rose-600" role="alert">
              {error}
            </p>
          )}
          <div>
            <label className="text-xs font-bold text-slate-500">Full name</label>
            <input
              value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="parent">parent</option>
              <option value="child">child</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500">
              Parent user ID (for child accounts)
            </label>
            <input
              value={form.parent_user_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, parent_user_id: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm"
              placeholder="UUID or empty"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500">
              Date of birth
            </label>
            <input
              type="date"
              value={form.date_of_birth}
              onChange={(e) =>
                setForm((f) => ({ ...f, date_of_birth: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500">Birth year</label>
            <input
              type="number"
              value={form.birth_year}
              onChange={(e) => setForm((f) => ({ ...f, birth_year: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          {(user.role === 'parent' || user.role === 'admin') && (
            <div>
              <label className="text-xs font-bold text-slate-500">
                New password (optional, parent/admin only)
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Leave blank to keep current"
                autoComplete="new-password"
              />
            </div>
          )}
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-cyan-300 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
