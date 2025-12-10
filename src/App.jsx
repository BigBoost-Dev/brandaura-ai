import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './hooks/useStore'

// Pages
import LandingPage from './pages/LandingPage'
import { LoginPage, SignupPage } from './pages/AuthPages'
import Dashboard from './pages/DashboardPage'

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
  const { initialize, loading } = useAuthStore()
  const location = useLocation()
  const [initialized, setInitialized] = useState(false)

  // Initialize auth on mount
  useEffect(() => {
    const init = async () => {
      await initialize()
      setInitialized(true)
    }
    init()
  }, [])

  // Clean up OAuth tokens from URL hash
  useEffect(() => {
    if (window.location.hash && window.location.hash.includes('access_token')) {
      // Clean the URL without reloading
      const cleanUrl = window.location.pathname + window.location.search
      window.history.replaceState(null, '', cleanUrl)
    }
  }, [location])

  // Show loading until auth is initialized
  if (!initialized || loading) {
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

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
