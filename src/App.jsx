import { useEffect } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import { Footer } from './components/Footer.jsx'
import { Header } from './components/Header.jsx'
import { PrivateRoute } from './components/PrivateRoute.jsx'
import { AuthProvider, useAuth } from './context'
import { Login } from './pages/auth/Login.jsx'
import { Register } from './pages/auth/Register.jsx'
import { ForgotPassword } from './pages/auth/ForgotPassword.jsx'
import { ResetPassword } from './pages/auth/ResetPassword.jsx'
import { NotFound } from './pages/NotFound.jsx'
import { AddChild } from './pages/parent/AddChild.jsx'
import { ChildReport } from './pages/parent/ChildReport.jsx'
import { ParentDashboard } from './pages/parent/ParentDashboard.jsx'
import { QuizSelect } from './pages/child/QuizSelect.jsx'
import { TakeQuiz } from './pages/child/TakeQuiz.jsx'
import { Results } from './pages/child/Results.jsx'
import { AdminLayout } from './pages/admin/AdminLayout.jsx'
import { AdminOverview } from './pages/admin/AdminOverview.jsx'
import { AdminUsers } from './pages/admin/AdminUsers.jsx'
import { AdminUserDetail } from './pages/admin/AdminUserDetail.jsx'
import { AdminSessions } from './pages/admin/AdminSessions.jsx'
import { AdminSessionDetail } from './pages/admin/AdminSessionDetail.jsx'
import { AdminQuizzes } from './pages/admin/AdminQuizzes.jsx'
import { AdminQuizEditor } from './pages/admin/AdminQuizEditor.jsx'
import { AdminSettings } from './pages/admin/AdminSettings.jsx'
import { AdminInsights } from './pages/admin/AdminInsights.jsx'
import { AdminApis } from './pages/admin/AdminApis.jsx'
import { captureAttributionToStorage } from './utils/attribution.js'

const parentAllowedRoles = ['parent', 'admin']
const childAllowedRoles = ['child']
const adminAllowedRoles = ['admin']

function RootRedirect() {
  const { token, user } = useAuth()
  if (!token || !user) {
    return <Navigate to="/login" replace />
  }
  if (user.role === 'child') {
    return <Navigate to="/child/quiz" replace />
  }
  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />
  }
  if (user.role === 'parent') {
    return <Navigate to="/parent/dashboard" replace />
  }
  return <Navigate to="/login" replace />
}

function AttributionCapture() {
  const { search } = useLocation()
  useEffect(() => {
    captureAttributionToStorage()
  }, [search])
  return null
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/admin"
        element={
          <PrivateRoute allowedRoles={adminAllowedRoles}>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<AdminOverview />} />
        <Route path="insights" element={<AdminInsights />} />
        <Route path="apis" element={<AdminApis />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="users/:id" element={<AdminUserDetail />} />
        <Route path="sessions" element={<AdminSessions />} />
        <Route path="sessions/:sessionId" element={<AdminSessionDetail />} />
        <Route path="quizzes" element={<AdminQuizzes />} />
        <Route path="quizzes/:id" element={<AdminQuizEditor />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
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
        path="/parent/child/:id"
        element={
          <PrivateRoute allowedRoles={parentAllowedRoles}>
            <ChildReport />
          </PrivateRoute>
        }
      />
      <Route
        path="/child/quiz"
        element={
          <PrivateRoute allowedRoles={childAllowedRoles}>
            <QuizSelect />
          </PrivateRoute>
        }
      />
      <Route
        path="/child/quiz/:slug"
        element={
          <PrivateRoute allowedRoles={childAllowedRoles}>
            <TakeQuiz />
          </PrivateRoute>
        }
      />
      <Route
        path="/child/results/:sessionId"
        element={
          <PrivateRoute allowedRoles={childAllowedRoles}>
            <Results />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AttributionCapture />
        <div className="flex min-h-screen flex-col bg-slate-50">
          <Header />
          <main className="flex-1">
            <AppRoutes />
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}
