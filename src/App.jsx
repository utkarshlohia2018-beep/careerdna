// Main App component with routing
import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from '@/hooks/useAuth'

// Tiny inline spinner — shown while a lazy chunk loads (usually < 200ms)
function PageSpinner() {
  return (
    <div className="min-h-screen bg-[#050510] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
    </div>
  )
}

// Lazy-load every page — each becomes its own JS chunk loaded on demand
const LandingPage        = lazy(() => import('@/pages/LandingPage'))
const LoginPage          = lazy(() => import('@/pages/auth/LoginPage'))
const SignupPage         = lazy(() => import('@/pages/auth/SignupPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
const DashboardPage      = lazy(() => import('@/pages/dashboard/DashboardPage'))
const ResumePage         = lazy(() => import('@/pages/dashboard/ResumePage'))
const ProjectsPage       = lazy(() => import('@/pages/dashboard/ProjectsPage'))
const VideosPage         = lazy(() => import('@/pages/dashboard/VideosPage'))
const AchievementsPage   = lazy(() => import('@/pages/dashboard/AchievementsPage'))
const AnalyticsPage      = lazy(() => import('@/pages/dashboard/AnalyticsPage'))
const AIToolsPage        = lazy(() => import('@/pages/dashboard/AIToolsPage'))
const SettingsPage       = lazy(() => import('@/pages/dashboard/SettingsPage'))
const PublicProfilePage  = lazy(() => import('@/pages/public/PublicProfilePage'))

// Protected route — must be logged in
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <PageSpinner />
  if (!user) return <Navigate to="/login" replace />
  return children
}

// Public route — redirect to dashboard if already logged in
function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <PageSpinner />
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Routes>
        {/* Landing */}
        <Route path="/" element={<LandingPage />} />

        {/* Public profile */}
        <Route path="/u/:username" element={<PublicProfilePage />} />

        {/* Auth */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/dashboard/resume" element={<ProtectedRoute><ResumePage /></ProtectedRoute>} />
        <Route path="/dashboard/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
        <Route path="/dashboard/videos" element={<ProtectedRoute><VideosPage /></ProtectedRoute>} />
        <Route path="/dashboard/achievements" element={<ProtectedRoute><AchievementsPage /></ProtectedRoute>} />
        <Route path="/dashboard/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/dashboard/ai-tools" element={<ProtectedRoute><AIToolsPage /></ProtectedRoute>} />
        <Route path="/dashboard/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(15, 15, 30, 0.95)',
              color: '#f8fafc',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              backdropFilter: 'blur(20px)',
            },
            success: { iconTheme: { primary: '#7c3aed', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
