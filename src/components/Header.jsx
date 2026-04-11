import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export function Header() {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isLoggedIn = Boolean(user && token)
  const isParentLike =
    isLoggedIn && (user.role === 'parent' || user.role === 'admin')
  const isChild = isLoggedIn && user.role === 'child'

  let logoTo = '/'
  if (isParentLike) logoTo = '/parent/dashboard'
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
        <Link
          to={logoTo}
          className="group flex shrink-0 items-baseline gap-0.5 text-lg font-bold tracking-tight sm:text-xl"
        >
          <span className="text-white transition group-hover:text-white/95">
            KidsCareer
          </span>
          <span className="text-[#00D4FF] transition group-hover:brightness-110">
            Decoder
          </span>
        </Link>

        <nav
          className={`flex w-full flex-1 items-center justify-end gap-2 sm:w-auto sm:gap-3 ${
            isChild ? 'sm:gap-4' : ''
          }`}
        >
          {!isLoggedIn && (
            <>
              <Link to="/login" className={linkBaseClass}>
                Login
              </Link>
              <Link to="/register" className={accentButtonClass}>
                Register
              </Link>
            </>
          )}

          {isParentLike && (
            <>
              <Link to="/parent/dashboard" className={linkBaseClass}>
                Dashboard
              </Link>
              <Link to="/parent/add-child" className={linkBaseClass}>
                Add Child
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-white/20 bg-transparent px-3 py-2 text-sm font-medium text-white/95 transition hover:border-[#00D4FF]/60 hover:text-[#00D4FF]"
              >
                Logout
              </button>
            </>
          )}

          {isChild && (
            <>
              <p className="mr-1 max-w-[min(100%,14rem)] truncate text-center text-base font-semibold text-white sm:mr-2 sm:max-w-xs sm:text-left sm:text-lg">
                Hi{' '}
                <span className="font-bold text-[#00D4FF]">{user.name}</span>!
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
