import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, getApiError } from '../../utils/api.js'

function formatWhen(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString()
}

export function AdminUsers() {
  const [users, setUsers] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [role, setRole] = useState('')
  const [utmSource, setUtmSource] = useState('')
  const [appliedUtm, setAppliedUtm] = useState('')
  const [loadState, setLoadState] = useState('loading')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoadState('loading')
    setError('')
    try {
      const params = new URLSearchParams({ page: String(page), limit: '25' })
      if (appliedSearch.trim()) params.set('search', appliedSearch.trim())
      if (role) params.set('role', role)
      if (appliedUtm.trim()) params.set('utm_source', appliedUtm.trim())
      const { data } = await api.get(`/admin/users?${params}`)
      setUsers(data.users ?? [])
      setTotalPages(data.totalPages ?? 1)
      setLoadState('ready')
    } catch (err) {
      setError(getApiError(err))
      setLoadState('error')
    }
  }, [page, appliedSearch, role, appliedUtm])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async list fetch
    void load()
  }, [load])

  function submitSearch(e) {
    e.preventDefault()
    setAppliedSearch(search.trim())
    setAppliedUtm(utmSource.trim())
    setPage(1)
  }

  return (
    <div className="px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-extrabold text-slate-900">Users</h1>
        <p className="mt-1 text-slate-600">
          Parents, children, and admins. Edit profiles from the detail page.
        </p>

        <form
          onSubmit={submitSearch}
          className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="min-w-[200px] flex-1">
            <label htmlFor="userSearch" className="text-xs font-bold text-slate-500">
              Search name or email
            </label>
            <input
              id="userSearch"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Search…"
            />
          </div>
          <div>
            <label htmlFor="roleFilter" className="text-xs font-bold text-slate-500">
              Role
            </label>
            <select
              id="roleFilter"
              value={role}
              onChange={(e) => {
                setRole(e.target.value)
                setPage(1)
              }}
              className="mt-1 block rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">All</option>
              <option value="parent">Parent</option>
              <option value="child">Child</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label htmlFor="utmFilter" className="text-xs font-bold text-slate-500">
              UTM source
            </label>
            <input
              id="utmFilter"
              value={utmSource}
              onChange={(e) => setUtmSource(e.target.value)}
              className="mt-1 w-full min-w-[140px] rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="e.g. google"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-cyan-300"
          >
            Apply
          </button>
        </form>

        {loadState === 'loading' && (
          <p className="mt-8 text-center text-slate-600">Loading…</p>
        )}
        {loadState === 'error' && (
          <div className="mt-8 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
            {error}
          </div>
        )}

        {loadState === 'ready' && (
          <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-bold text-slate-700">Created</th>
                  <th className="px-4 py-3 font-bold text-slate-700">Name</th>
                  <th className="px-4 py-3 font-bold text-slate-700">Email</th>
                  <th className="px-4 py-3 font-bold text-slate-700">Role</th>
                  <th className="px-4 py-3 font-bold text-slate-700">UTM</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      No users match.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="border-b border-slate-100">
                      <td className="px-4 py-3 text-slate-600">
                        {formatWhen(u.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/admin/users/${u.id}`}
                          className="font-medium text-sky-700 hover:underline"
                        >
                          {u.full_name}
                        </Link>
                      </td>
                      <td className="break-all px-4 py-3 text-slate-700">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-bold uppercase">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {u.attribution_json?.utm_source ?? '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-300 px-3 py-1 text-sm disabled:opacity-40"
            >
              Previous
            </button>
            <span className="py-1 text-sm text-slate-600">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-slate-300 px-3 py-1 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
