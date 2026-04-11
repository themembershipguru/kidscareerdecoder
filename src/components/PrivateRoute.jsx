import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context'

function getHomePathForRole(role) {
  if (role === 'child') return '/child/quiz'
  if (role === 'parent' || role === 'admin') return '/parent/dashboard'
  return '/login'
}

export function PrivateRoute({ children, allowedRoles }) {
  const { token, user } = useAuth()
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={getHomePathForRole(user?.role)} replace />
  }

  return children
}
