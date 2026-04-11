import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Header } from './components/Header.jsx'
import { PrivateRoute } from './components/PrivateRoute.jsx'
import { AuthProvider, useAuth } from './context'
import { Login } from './pages/auth/Login.jsx'
import { Register } from './pages/auth/Register.jsx'
import { AddChild } from './pages/parent/AddChild.jsx'
import { ParentDashboard } from './pages/parent/ParentDashboard.jsx'
import { TakeQuiz } from './pages/child/TakeQuiz.jsx'
import { Results } from './pages/child/Results.jsx'

const parentAllowedRoles = ['parent', 'admin']
const childAllowedRoles = ['child']

function RootRedirect() {
  const { token, user } = useAuth()
  if (!token || !user) {
    return <Navigate to="/login" replace />
  }
  if (user.role === 'child') {
    return <Navigate to="/child/quiz" replace />
  }
  if (user.role === 'parent' || user.role === 'admin') {
    return <Navigate to="/parent/dashboard" replace />
  }
  return <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/parent/dashboard"
        element={
          <PrivateRoute allowedRoles={parentAllowedRoles}>
            <ParentDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/parent/add-child"
        element={
          <PrivateRoute allowedRoles={parentAllowedRoles}>
            <AddChild />
          </PrivateRoute>
        }
      />
      <Route
        path="/child/quiz"
        element={
          <PrivateRoute allowedRoles={childAllowedRoles}>
            <TakeQuiz />
          </PrivateRoute>
        }
      />
      <Route
        path="/child/results"
        element={
          <PrivateRoute allowedRoles={childAllowedRoles}>
            <Results />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex min-h-screen flex-col bg-slate-50">
          <Header />
          <main className="flex-1">
            <AppRoutes />
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}
