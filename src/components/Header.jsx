import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context'

export function Header() {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setMenuOpen(false)
    navigate('/login')
  }

  const isLoggedIn = Boolean(user && token)
  const isAdmin = isLoggedIn && user.role === 'admin'
  const isParentLike =
    isLoggedIn && (user.role === 'parent' || user.role === 'admin')
  const isChild = isLoggedIn && user.role === 'child'
  const displayName = user?.full_name || user?.name || 'there'

  let logoTo = '/'
  if (isAdmin) logoTo = '/admin'
  else if (isParentLike) logoTo = '/parent/dashboard'
  if (isChild) logoTo = '/child/quiz'

  const linkBaseClass =
    'rounded-lg px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-[#00D4FF]'
  const accentButtonClass =
    'rounded-lg border border-[#00D4FF]/50 bg-[#00D4FF]/10 px-3 py-2 text-sm font-semibold text-[#00D4FF] transition hover:border-[#00D4FF] hover:bg-[#00D4FF]/20'

  return (
    <header
      className={`sticky top-0 z-50 border-b border-white/10 bg-[#1A1A2E] shadow-[0_4px_24px_rgba(0,0,0,0.12)] ${
        isChild ? 'py-3.5' : 'py-3'
      }`}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 sm:flex-nowrap sm:gap-4 sm:px-6 lg:px-8">
        <div className="flex w-full items-center justify-between sm:w-auto sm:justify-start">
          <Link
            to={logoTo}
            onClick={() => setMenuOpen(false)}
            className="group flex shrink-0 items-baseline gap-0.5 text-lg font-bold tracking-tight sm:text-xl"
          >
            <span className="text-white transition group-hover:text-white/95">
              KidsCareer
            </span>
            <span className="text-[#00D4FF] transition group-hover:brightness-110">
              Decoder
            </span>
          </Link>
          <button
            type="button"
            className="rounded-lg p-2 text-white sm:hidden"
            aria-expanded={menuOpen}
            aria-label="Menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="block h-0.5 w-6 bg-white" />
            <span className="mt-1.5 block h-0.5 w-6 bg-white" />
            <span className="mt-1.5 block h-0.5 w-6 bg-white" />
          </button>
        </div>

        <nav
          className={`flex w-full flex-col gap-1 sm:w-auto sm:flex-1 sm:flex-row sm:items-center sm:justify-end sm:gap-3 ${
            menuOpen ? 'flex pb-3 sm:pb-0' : 'hidden sm:flex'
          }`}
        >
          {!isLoggedIn && (
            <>
              <Link to="/login" className={linkBaseClass} onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link
                to="/register"
                className={accentButtonClass}
                onClick={() => setMenuOpen(false)}
              >
                Register
              </Link>
            </>
          )}

          {isParentLike && (
            <>
              {isAdmin && (
                <Link
                  to="/admin"
                  className={linkBaseClass}
                  onClick={() => setMenuOpen(false)}
                >
                  Admin
                </Link>
              )}
              <Link
                to="/parent/dashboard"
                className={linkBaseClass}
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/parent/add-child"
                className={linkBaseClass}
                onClick={() => setMenuOpen(false)}
              >
                Add Child
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-white/20 bg-transparent px-3 py-2 text-left text-sm font-medium text-white/95 transition hover:border-[#00D4FF]/60 hover:text-[#00D4FF] sm:text-center"
              >
                Logout
              </button>
            </>
          )}

          {isChild && (
            <>
              <p className="mr-1 max-w-[min(100%,14rem)] truncate px-3 py-2 text-center text-base font-semibold text-white sm:mr-2 sm:max-w-xs sm:text-left sm:text-lg">
                Hi{' '}
                <span className="font-bold text-[#00D4FF]">{displayName}</span>!
              </p>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border-2 border-[#00D4FF]/50 bg-[#00D4FF]/15 px-4 py-2 text-sm font-bold text-[#00D4FF] shadow-sm transition hover:border-[#00D4FF] hover:bg-[#00D4FF]/25"
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
