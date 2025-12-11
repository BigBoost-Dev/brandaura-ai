import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './hooks/useStore'

// Pages
import LandingPage from './pages/LandingPage'
import { LoginPage, SignupPage } from './pages/AuthPages'
import Dashboard from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'

// Loading spinner
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
    </div>
  )
}

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore()

  if (loading) {
    return <LoadingScreen />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Public Route (redirects to dashboard if logged in)
function PublicRoute({ children }) {
  const { user, loading } = useAuthStore()

  if (loading) {
    return <LoadingScreen />
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default function App() {
  const { initialize, user, loading } = useAuthStore()
  const location = useLocation()
  const [authReady, setAuthReady] = useState(false)

  // Initialize auth on mount
  useEffect(() => {
    const init = async () => {
      await initialize()
      
      // If there's an OAuth hash, wait a bit for session to process
      if (window.location.hash && window.location.hash.includes('access_token')) {
        // Clean URL
        window.history.replaceState(null, '', window.location.pathname)
        // Wait for auth state to settle
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      setAuthReady(true)
    }
    init()
  }, [])

  // Show loading until auth is fully ready
  if (!authReady || loading) {
    return <LoadingScreen />
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } 
      />
      
      <Route 
        path="/signup" 
        element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        } 
      />

      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } 
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
