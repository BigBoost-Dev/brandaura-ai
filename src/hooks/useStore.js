import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, db } from '../lib/supabase'

// Auth Store
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      loading: true,
      error: null,

      // Initialize auth state
      initialize: async () => {
        try {
          set({ loading: true, error: null })
          
          // Get current session - Supabase handles OAuth callback automatically
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()
          
          if (sessionError) {
            console.error('Session error:', sessionError)
            set({ user: null, profile: null, loading: false })
            return
          }
          
          if (session?.user) {
            let profile = null
            try {
              profile = await db.profiles.get(session.user.id)
            } catch (e) {
              console.warn('Profile fetch failed:', e)
            }
            set({ user: session.user, profile, loading: false })
          } else {
            set({ user: null, profile: null, loading: false })
          }
          
          // Listen for auth changes
          supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth event:', event)
            
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
              if (session?.user) {
                let profile = null
                try {
                  profile = await db.profiles.get(session.user.id)
                } catch (e) {
                  console.warn('Profile fetch failed:', e)
                }
                set({ user: session.user, profile, loading: false })
              }
            } else if (event === 'SIGNED_OUT') {
              set({ user: null, profile: null, loading: false })
            }
          })
        } catch (error) {
          console.error('Auth init error:', error)
          set({ error: error.message, loading: false, user: null, profile: null })
        }
      },

      // Sign in with Google
      signInWithGoogle: async () => {
        try {
          set({ error: null })
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/dashboard`
            }
          })
          if (error) throw error
          return { error: null }
        } catch (error) {
          console.error('Google sign in error:', error)
          set({ error: error.message })
          return { error }
        }
      },

      // Sign in with email
      signIn: async (email, password) => {
        try {
          set({ loading: true, error: null })
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          })
          if (error) throw error
          
          let profile = null
          try {
            profile = await db.profiles.get(data.user.id)
          } catch (e) {
            console.warn('Profile fetch failed:', e)
          }
          set({ user: data.user, profile, loading: false })
          return { user: data.user, error: null }
        } catch (error) {
          console.error('Sign in error:', error)
          set({ error: error.message, loading: false })
          return { error }
        }
      },

      // Sign up
      signUp: async (email, password, metadata = {}) => {
        try {
          set({ loading: true, error: null })
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: metadata }
          })
          if (error) throw error
          set({ user: data.user, loading: false })
          return { user: data.user, error: null }
        } catch (error) {
          console.error('Sign up error:', error)
          set({ error: error.message, loading: false })
          return { error }
        }
      },

      // Sign out
      signOut: async () => {
        try {
          set({ loading: true })
          const { error } = await supabase.auth.signOut()
          if (error) throw error
          set({ user: null, profile: null, loading: false })
        } catch (error) {
          console.error('Sign out error:', error)
          set({ error: error.message, loading: false })
          throw error
        }
      },

      // Update profile
      updateProfile: async (updates) => {
        try {
          const { user } = get()
          if (!user) throw new Error('Not authenticated')
          
          const profile = await db.profiles.update(user.id, updates)
          set({ profile })
          return profile
        } catch (error) {
          set({ error: error.message })
          throw error
        }
      },

      // Clear error
      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, profile: state.profile })
    }
  )
)

// Brands Store
export const useBrandsStore = create(
  persist(
    (set, get) => ({
      brands: [],
      activeBrandId: null,
      loading: false,
      error: null,

      // Get active brand
      getActiveBrand: () => {
        const { brands, activeBrandId } = get()
        return brands.find(b => b.id === activeBrandId) || brands[0]
      },

      // Load brands
      loadBrands: async (userId) => {
        try {
          set({ loading: true, error: null })
          const brands = await db.brands.list(userId)
          set({ 
            brands, 
            loading: false,
            activeBrandId: brands[0]?.id || null
          })
          return brands
        } catch (error) {
          set({ error: error.message, loading: false })
          throw error
        }
      },

      // Add brand
      addBrand: async (brand) => {
        try {
          set({ loading: true, error: null })
          const newBrand = await db.brands.create(brand)
          set(state => ({ 
            brands: [...state.brands, newBrand],
            activeBrandId: newBrand.id,
            loading: false 
          }))
          return newBrand
        } catch (error) {
          set({ error: error.message, loading: false })
          throw error
        }
      },

      // Update brand
      updateBrand: async (brandId, updates) => {
        try {
          const updatedBrand = await db.brands.update(brandId, updates)
          set(state => ({
            brands: state.brands.map(b => b.id === brandId ? updatedBrand : b)
          }))
          return updatedBrand
        } catch (error) {
          set({ error: error.message })
          throw error
        }
      },

      // Delete brand
      deleteBrand: async (brandId) => {
        try {
          await db.brands.delete(brandId)
          set(state => ({
            brands: state.brands.filter(b => b.id !== brandId),
            activeBrandId: state.activeBrandId === brandId ? state.brands[0]?.id : state.activeBrandId
          }))
        } catch (error) {
          set({ error: error.message })
          throw error
        }
      },

      // Set active brand
      setActiveBrand: (brandId) => set({ activeBrandId: brandId }),

      // Clear
      clear: () => set({ brands: [], activeBrandId: null, loading: false, error: null })
    }),
    {
      name: 'brands-storage',
      partialize: (state) => ({ brands: state.brands, activeBrandId: state.activeBrandId })
    }
  )
)

// Results Store
export const useResultsStore = create((set, get) => ({
  results: {},  // { brandId: results[] }
  loading: false,
  error: null,

  // Load results for brand
  loadResults: async (brandId, options = {}) => {
    try {
      set({ loading: true, error: null })
      const results = await db.results.list(brandId, options)
      set(state => ({
        results: { ...state.results, [brandId]: results },
        loading: false
      }))
      return results
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  // Add results
  addResults: async (brandId, newResults) => {
    try {
      const saved = await db.results.create(newResults)
      set(state => ({
        results: {
          ...state.results,
          [brandId]: [...(state.results[brandId] || []), ...saved]
        }
      }))
      return saved
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  // Get results for brand
  getResults: (brandId) => get().results[brandId] || [],

  // Clear results
  clear: () => set({ results: {}, loading: false, error: null })
}))

// UI Store
export const useUIStore = create((set) => ({
  sidebarOpen: true,
  activeTab: 'dashboard',
  isTestRunning: false,
  testProgress: { current: 0, total: 0, platform: '', query: '' },
  logs: [],

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setTestRunning: (running) => set({ isTestRunning: running }),
  setTestProgress: (progress) => set({ testProgress: progress }),
  addLog: (log) => set(state => ({ 
    logs: [...state.logs.slice(-150), { ...log, time: new Date().toISOString() }] 
  })),
  clearLogs: () => set({ logs: [] })
}))
