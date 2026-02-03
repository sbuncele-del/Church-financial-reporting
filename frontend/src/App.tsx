import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'

// Layouts
import DashboardLayout from './layouts/DashboardLayout'
import AuthLayout from './layouts/AuthLayout'
import Landing from './pages/Landing'

// Auth Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Dashboard Pages
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'

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
  const { isAuthenticated } = useAuthStore()
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }
  
  return <>{children}</>
}

function App() {
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
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        
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
      
      {/* Landing Page - visible to everyone */}
      <Route path="/" element={<Landing />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
