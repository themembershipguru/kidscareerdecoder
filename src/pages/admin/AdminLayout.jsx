import { NavLink, Outlet } from 'react-router-dom'

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-semibold transition ${
    isActive
      ? 'bg-slate-900 text-cyan-300'
      : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
  }`

export function AdminLayout() {
  return (
    <div className="min-h-full bg-slate-100">
      <div className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3 sm:px-6 lg:px-10">
          <p className="mr-2 text-xs font-bold uppercase tracking-[0.2em] text-violet-600">
            Admin
          </p>
          <nav className="flex flex-wrap gap-1">
            <NavLink to="/admin" end className={linkClass}>
              Overview
            </NavLink>
            <NavLink to="/admin/insights" className={linkClass}>
              Insights
            </NavLink>
            <NavLink to="/admin/users" className={linkClass}>
              Users
            </NavLink>
            <NavLink to="/admin/sessions" className={linkClass}>
              Sessions
            </NavLink>
            <NavLink to="/admin/quizzes" className={linkClass}>
              Quizzes
            </NavLink>
            <NavLink to="/admin/apis" className={linkClass}>
              APIs
            </NavLink>
            <NavLink to="/admin/settings" className={linkClass}>
              Settings
            </NavLink>
          </nav>
        </div>
      </div>
      <Outlet />
    </div>
  )
}
