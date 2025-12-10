import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, auth, db } from '../lib/supabase'

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
          
          // Check for existing session
          const session = await auth.getSession()
          
          if (session?.user) {
            const profile = await db.profiles.get(session.user.id)
            set({ user: session.user, profile, loading: false })
          } else {
            set({ user: null, profile: null, loading: false })
          }
          
          // Listen for auth changes
          auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
              const profile = await db.profiles.get(session.user.id)
              set({ user: session.user, profile })
            } else if (event === 'SIGNED_OUT') {
              set({ user: null, profile: null })
            }
          })
        } catch (error) {
          console.error('Auth init error:', error)
          set({ error: error.message, loading: false })
        }
      },

      // Sign in with Google
      signInWithGoogle: async () => {
        try {
          set({ loading: true, error: null })
          await auth.signInWithGoogle()
        } catch (error) {
          set({ error: error.message, loading: false })
          throw error
        }
      },

      // Sign in with email
      signIn: async (email, password) => {
        try {
          set({ loading: true, error: null })
          const { user } = await auth.signIn(email, password)
          const profile = await db.profiles.get(user.id)
          set({ user, profile, loading: false })
          return user
        } catch (error) {
          set({ error: error.message, loading: false })
          throw error
        }
      },

      // Sign up
      signUp: async (email, password, metadata = {}) => {
        try {
          set({ loading: true, error: null })
          const { user } = await auth.signUp(email, password, metadata)
          set({ user, loading: false })
          return user
        } catch (error) {
          set({ error: error.message, loading: false })
          throw error
        }
      },

      // Sign out
      signOut: async () => {
        try {
          set({ loading: true })
          await auth.signOut()
          set({ user: null, profile: null, loading: false })
        } catch (error) {
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
        console.log('Store addBrand called:', brand)
        try {
          set({ loading: true, error: null })
          console.log('Calling db.brands.create...')
          const newBrand = await db.brands.create(brand)
          console.log('db.brands.create returned:', newBrand)
          set(state => ({ 
            brands: [...state.brands, newBrand],
            activeBrandId: newBrand.id,
            loading: false 
          }))
          return newBrand
        } catch (error) {
          console.error('Store addBrand error:', error)
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
