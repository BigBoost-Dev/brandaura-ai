import React, { useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './hooks/useStore'
import { supabase } from './lib/supabase'

// Pages
import LandingPage from './pages/LandingPage'
import { LoginPage, SignupPage } from './pages/AuthPages'
import Dashboard from './pages/DashboardPage'

// Auth Callback Handler - cleans up OAuth tokens from URL
function AuthCallbackHandler() {
  const navigate = useNavigate()
  const location = useLocation()
  const { initialize } = useAuthStore()

  useEffect(() => {
    // Check if there's a hash with access_token (OAuth callback)
    const hashParams = new URLSearchParams(location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    
    if (accessToken || location.hash.includes('access_token')) {
      // Let Supabase handle the session from the URL
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          // Clean the URL by replacing with just /dashboard
          window.history.replaceState({}, '', '/dashboard')
          // Re-initialize auth state
          initialize()
        }
      })
    }
  }, [location, navigate, initialize])

  return null
}

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
      </div>
    )
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
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default function App() {
  const { initialize } = useAuthStore()
  const location = useLocation()

  // Initialize auth on mount
  useEffect(() => {
    initialize()
  }, [initialize])

  // Clean up OAuth tokens from URL on any page
  useEffect(() => {
    if (location.hash && location.hash.includes('access_token')) {
      // Remove hash from URL without triggering navigation
      const cleanUrl = window.location.pathname + window.location.search
      window.history.replaceState({}, '', cleanUrl)
    }
  }, [location])

  return (
    <>
      <AuthCallbackHandler />
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
    </>
  )
}
