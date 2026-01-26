import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { useEffect } from 'react'

// Layouts
import DashboardLayout from './layouts/DashboardLayout'
import AuthLayout from './layouts/AuthLayout'

// Auth Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Dashboard Pages
import Dashboard from './pages/Dashboard'
import Income from './pages/finance/Income'
import Expenses from './pages/finance/Expenses'
import Reports from './pages/finance/Reports'
import Members from './pages/Members'
import Settings from './pages/Settings'

// SOLAR Framework Pages
import { SOLARDashboard, SOLARAssessment } from './pages/solar'

// DEV MODE: Auto-login for testing (remove in production)
const DEV_MODE = true;

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, login } = useAuthStore()
  
  useEffect(() => {
    // DEV MODE: Auto-login with test user
    if (DEV_MODE && !isAuthenticated) {
      login(
        {
          id: 1,
          email: 'pastor@gracechurch.org',
          first_name: 'John',
          last_name: 'Pastor',
          role: 'admin',
          church_id: 1,
          is_active: true,
          is_verified: true,
          created_at: new Date().toISOString(),
        },
        'dev-token',
        'dev-refresh-token'
      );
    }
  }, [isAuthenticated, login]);
  
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
        <Route path="/finance/income" element={<Income />} />
        <Route path="/finance/expenses" element={<Expenses />} />
        <Route path="/finance/reports" element={<Reports />} />
        <Route path="/members" element={<Members />} />
        <Route path="/settings" element={<Settings />} />
        
        {/* SOLAR Framework Routes */}
        <Route path="/solar" element={<SOLARDashboard />} />
        <Route path="/solar/dashboard" element={<SOLARDashboard />} />
        <Route path="/solar/assessment" element={<SOLARAssessment />} />
        <Route path="/solar/assessment/:id" element={<SOLARAssessment />} />
      </Route>
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
