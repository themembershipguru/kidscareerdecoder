import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../context'
import { api, getApiError } from '../../utils/api.js'

export function ForgotPassword() {
  const { user, token } = useAuth()
  const [email, setEmail] = useState('')
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
    if (!email.trim()) {
      setFormError('Please enter your email.')
      return
    }
    setSubmitting(true)
    try {
      const { data } = await api.post('/auth/forgot-password', {
        email: email.trim(),
      })
      setMessage(data?.message ?? 'Check your email.')
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
          Forgot password
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[#1A1A2E]/65">
          Enter the email you used to register. We will send a reset link if an
          account exists (parent and admin accounts only).
        </p>

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="forgotEmail"
              className="block text-sm font-semibold text-[#1A1A2E]"
            >
              Email
            </label>
            <input
              id="forgotEmail"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[#1A1A2E] py-3 text-sm font-bold text-[#00D4FF] transition hover:bg-[#252542] disabled:opacity-60"
          >
            {submitting ? 'Sending…' : 'Send reset link'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-[#1A1A2E]/65">
          <Link
            to="/login"
            className="font-semibold text-[#00D4FF] underline-offset-2 hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
