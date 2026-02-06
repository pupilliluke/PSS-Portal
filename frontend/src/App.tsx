import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useUIStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'

// Auth pages - loaded immediately
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { LandingPage } from '@/pages/LandingPage'

// Lazy load other pages for better bundle optimization (react-best-practices: bundle-dynamic-imports)
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const AuditsPage = lazy(() => import('@/pages/audits/AuditsPage').then(m => ({ default: m.AuditsPage })))
const AuditDetailPage = lazy(() => import('@/pages/audits/AuditDetailPage').then(m => ({ default: m.AuditDetailPage })))
const CreateAuditPage = lazy(() => import('@/pages/audits/CreateAuditPage').then(m => ({ default: m.CreateAuditPage })))
const EditAuditPage = lazy(() => import('@/pages/audits/EditAuditPage').then(m => ({ default: m.EditAuditPage })))
const LeadsPage = lazy(() => import('@/pages/leads/LeadsPage').then(m => ({ default: m.LeadsPage })))
const FindingsPage = lazy(() => import('@/pages/findings/FindingsPage').then(m => ({ default: m.FindingsPage })))
const FindingDetailPage = lazy(() => import('@/pages/findings/FindingDetailPage').then(m => ({ default: m.FindingDetailPage })))
const CreateFindingPage = lazy(() => import('@/pages/findings/CreateFindingPage').then(m => ({ default: m.CreateFindingPage })))
const ActivityPage = lazy(() => import('@/pages/ActivityPage').then(m => ({ default: m.ActivityPage })))
const AttachmentsPage = lazy(() => import('@/pages/AttachmentsPage').then(m => ({ default: m.AttachmentsPage })))
const PricingPage = lazy(() => import('@/pages/PricingPage').then(m => ({ default: m.PricingPage })))
const BillingPage = lazy(() => import('@/pages/settings/BillingPage').then(m => ({ default: m.BillingPage })))

// Create query client with sensible defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    </div>
  )
}

// Theme initialization component
function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useUIStore()

  useEffect(() => {
    // Apply theme on mount
    setTheme(theme)

    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        setTheme('system')
      }
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, setTheme])

  return <>{children}</>
}

// Auth initialization component
function AuthProvider({ children }: { children: React.ReactNode }) {
  const { checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return <>{children}</>
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/pricing"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <PricingPage />
                  </Suspense>
                }
              />

              {/* Protected routes */}
              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/app/dashboard" replace />} />

                <Route
                  path="dashboard"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <DashboardPage />
                    </Suspense>
                  }
                />

                {/* Leads */}
                <Route
                  path="leads"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <LeadsPage />
                    </Suspense>
                  }
                />

                {/* Audits */}
                <Route
                  path="audits"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <AuditsPage />
                    </Suspense>
                  }
                />
                <Route
                  path="audits/new"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <CreateAuditPage />
                    </Suspense>
                  }
                />
                <Route
                  path="audits/:id"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <AuditDetailPage />
                    </Suspense>
                  }
                />
                <Route
                  path="audits/:id/edit"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <EditAuditPage />
                    </Suspense>
                  }
                />

                {/* Findings */}
                <Route
                  path="findings"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <FindingsPage />
                    </Suspense>
                  }
                />
                <Route
                  path="findings/new"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <CreateFindingPage />
                    </Suspense>
                  }
                />
                <Route
                  path="findings/:id"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <FindingDetailPage />
                    </Suspense>
                  }
                />

                {/* Activity */}
                <Route
                  path="activity"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <ActivityPage />
                    </Suspense>
                  }
                />

                {/* Attachments */}
                <Route
                  path="attachments"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <AttachmentsPage />
                    </Suspense>
                  }
                />

                {/* Settings */}
                <Route path="settings" element={<Navigate to="/app/settings/billing" replace />} />
                <Route
                  path="settings/billing"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <BillingPage />
                    </Suspense>
                  }
                />
              </Route>

              {/* 404 */}
              <Route
                path="*"
                element={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-6xl font-bold text-muted-foreground mb-4">404</h1>
                      <p className="text-xl mb-4">Page not found</p>
                      <a href="/" className="text-primary hover:underline">
                        Go to Home
                      </a>
                    </div>
                  </div>
                }
              />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
