import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { authService } from './services/authService'

// Layouts
import DashboardLayout from './layouts/DashboardLayout'
import AuthLayout from './layouts/AuthLayout'
import Landing from './pages/Landing'
import About from './pages/About'

// Auth Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Dashboard Pages
import Settings from './pages/Settings'
import Users from './pages/settings/Users'

// Platform / God's Eye Pages
import PlatformDashboard from './pages/platform/PlatformDashboard'
import ChurchDetail from './pages/platform/ChurchDetail'

// Finance Pages (now under Resources)
import Income from './pages/finance/Income'
import Expenses from './pages/finance/Expenses'
import Reports from './pages/finance/Reports'
import Budget from './pages/finance/Budget'
import FinancialDashboard from './pages/finance/FinancialDashboard'

// Members (now under Love & Care)
import Members from './pages/Members'

// SOLAR Framework Pages
import { 
  SOLARDashboard, 
  SOLARAssessment,
  SpiritualVitality,
  OrganisationalGovernance,
  LoveCare,
  Advancement,
  Resources,
} from './pages/solar'

// Dev mode disabled: require real sign-in/sign-up
const DEV_MODE = false;

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  
  if (!isAuthenticated && !DEV_MODE) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

// Public Route Component (redirects to dashboard if logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore()

  if (isAuthenticated) {
    return <Navigate to={user?.role === 'super_admin' ? '/platform' : '/dashboard'} replace />
  }

  return <>{children}</>
}

// Super Admin only route
function SuperAdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'super_admin') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function App() {
  const { isAuthenticated, setUser, token } = useAuthStore()

  // Refresh user data from server on app load to ensure church_id and role are current
  useEffect(() => {
    if (isAuthenticated && token) {
      authService.getCurrentUser()
        .then(user => {
          setUser(user)
        })
        .catch(() => {
          // Token might be expired - ignore, the interceptor will handle it
        })
    }
  }, [isAuthenticated, token, setUser])

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={
          <PublicRoute><Login /></PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute><Register /></PublicRoute>
        } />
      </Route>
      
      {/* Protected Routes */}
      <Route element={
        <ProtectedRoute><DashboardLayout /></ProtectedRoute>
      }>
        <Route path="/dashboard" element={<FinancialDashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/users" element={<Users />} />
        
        {/* SOLAR Framework - Main Routes */}
        <Route path="/solar" element={<SOLARDashboard />} />
        <Route path="/solar/dashboard" element={<SOLARDashboard />} />
        <Route path="/solar/assessment" element={<SOLARAssessment />} />
        <Route path="/solar/assessment/:id" element={<SOLARAssessment />} />
        
        {/* S - Spiritual Vitality */}
        <Route path="/solar/spiritual" element={<SpiritualVitality />} />
        <Route path="/solar/spiritual/*" element={<SpiritualVitality />} />
        
        {/* O - Organisational Governance */}
        <Route path="/solar/organisational" element={<OrganisationalGovernance />} />
        <Route path="/solar/organisational/*" element={<OrganisationalGovernance />} />
        
        {/* L - Love & Care */}
        <Route path="/solar/love-care" element={<LoveCare />} />
        <Route path="/solar/love-care/members" element={<Members />} />
        <Route path="/solar/love-care/*" element={<LoveCare />} />
        
        {/* A - Advancement */}
        <Route path="/solar/advancement" element={<Advancement />} />
        <Route path="/solar/advancement/*" element={<Advancement />} />
        
        {/* R - Resources (includes Finance) */}
        <Route path="/solar/resources" element={<Resources />} />
        <Route path="/solar/resources/financial" element={<FinancialDashboard />} />
        <Route path="/solar/resources/financial/dashboard" element={<FinancialDashboard />} />
        <Route path="/solar/resources/financial/income" element={<Income />} />
        <Route path="/solar/resources/financial/expenses" element={<Expenses />} />
        <Route path="/solar/resources/financial/budget" element={<Budget />} />
        <Route path="/solar/resources/financial/reports" element={<Reports />} />
        <Route path="/solar/resources/*" element={<Resources />} />
        
        {/* Legacy routes - redirect to new SOLAR structure */}
        <Route path="/finance/income" element={<Navigate to="/solar/resources/financial/income" replace />} />
        <Route path="/finance/expenses" element={<Navigate to="/solar/resources/financial/expenses" replace />} />
        <Route path="/finance/reports" element={<Navigate to="/solar/resources/financial/reports" replace />} />
        <Route path="/members" element={<Navigate to="/solar/love-care/members" replace />} />
      </Route>
      
      {/* Platform / God's Eye Routes — super_admin only */}
      <Route element={
        <SuperAdminRoute><DashboardLayout /></SuperAdminRoute>
      }>
        <Route path="/platform" element={<PlatformDashboard />} />
        <Route path="/platform/church/:id" element={<ChurchDetail />} />
      </Route>

      {/* Landing Page - only for unauthenticated users */}
      <Route path="/" element={
        <PublicRoute><Landing /></PublicRoute>
      } />

      {/* About SOLAR - public page */}
      <Route path="/about" element={<About />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
