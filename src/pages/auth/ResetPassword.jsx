import { useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context'
import { api, getApiError } from '../../utils/api.js'

export function ResetPassword() {
  const { user, token } = useAuth()
  const [searchParams] = useSearchParams()
  const tokenParam = searchParams.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user && token) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    setMessage('')
    if (!tokenParam.trim()) {
      setFormError('Missing reset token. Open the link from your email.')
      return
    }
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setFormError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    try {
      const { data } = await api.post('/auth/reset-password', {
        token: tokenParam.trim(),
        password,
      })
      setMessage(data?.message ?? 'Password updated.')
    } catch (err) {
      setFormError(getApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-[#1A1A2E]/10 bg-white p-8 shadow-lg shadow-[#1A1A2E]/5">
        <h1 className="text-2xl font-bold tracking-tight text-[#1A1A2E]">
          Set new password
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[#1A1A2E]/65">
          Choose a new password for your account.
        </p>

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="resetPassword"
              className="block text-sm font-semibold text-[#1A1A2E]"
            >
              New password
            </label>
            <input
              id="resetPassword"
              name="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#1A1A2E]/15 bg-slate-50 px-3 py-2.5 text-[#1A1A2E] outline-none transition focus:border-[#00D4FF]/50 focus:ring-2 focus:ring-[#00D4FF]/25"
            />
          </div>
          <div>
            <label
              htmlFor="resetConfirm"
              className="block text-sm font-semibold text-[#1A1A2E]"
            >
              Confirm password
            </label>
            <input
              id="resetConfirm"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#1A1A2E]/15 bg-slate-50 px-3 py-2.5 text-[#1A1A2E] outline-none transition focus:border-[#00D4FF]/50 focus:ring-2 focus:ring-[#00D4FF]/25"
            />
          </div>

          {formError && (
            <p className="text-sm font-medium text-rose-600" role="alert">
              {formError}
            </p>
          )}
          {message && (
            <p className="text-sm font-medium text-emerald-700" role="status">
              {message}{' '}
              <Link
                to="/login"
                className="font-semibold text-[#00D4FF] underline-offset-2 hover:underline"
              >
                Sign in
              </Link>
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || Boolean(message)}
            className="w-full rounded-lg bg-[#1A1A2E] py-3 text-sm font-bold text-[#00D4FF] transition hover:bg-[#252542] disabled:opacity-60"
          >
            {submitting ? 'Saving…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  )
}
