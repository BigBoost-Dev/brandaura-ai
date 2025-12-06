import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Using demo mode.')
}

export const supabase = createClient(
  supabaseUrl || 'https://demo.supabase.co',
  supabaseAnonKey || 'demo-key'
)

// Auth helpers
export const auth = {
  // Sign up with email
  async signUp(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
    })
    if (error) throw error
    return data
  },

  // Sign in with email
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    return data
  },

  // Sign in with Google
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })
    if (error) throw error
    return data
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get current session
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  },

  // Get current user
  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  // Listen to auth changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database helpers
export const db = {
  // Profiles
  profiles: {
    async get(userId) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (error) throw error
      return data
    },

    async update(userId, updates) {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()
      if (error) throw error
      return data
    }
  },

  // Brands
  brands: {
    async list(userId) {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },

    async get(brandId) {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('id', brandId)
        .single()
      if (error) throw error
      return data
    },

    async create(brand) {
      const { data, error } = await supabase
        .from('brands')
        .insert(brand)
        .select()
        .single()
      if (error) throw error
      return data
    },

    async update(brandId, updates) {
      const { data, error } = await supabase
        .from('brands')
        .update(updates)
        .eq('id', brandId)
        .select()
        .single()
      if (error) throw error
      return data
    },

    async delete(brandId) {
      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', brandId)
      if (error) throw error
    }
  },

  // Test Results
  results: {
    async list(brandId, options = {}) {
      let query = supabase
        .from('test_results')
        .select('*')
        .eq('brand_id', brandId)
        .order('created_at', { ascending: false })

      if (options.limit) query = query.limit(options.limit)
      if (options.offset) query = query.range(options.offset, options.offset + (options.limit || 50) - 1)

      const { data, error } = await query
      if (error) throw error
      return data
    },

    async create(results) {
      const { data, error } = await supabase
        .from('test_results')
        .insert(results)
        .select()
      if (error) throw error
      return data
    },

    async getStats(brandId) {
      const { data, error } = await supabase
        .from('test_results')
        .select('brand_mention, platform_id, created_at')
        .eq('brand_id', brandId)
      if (error) throw error
      return data
    }
  },

  // Schedules
  schedules: {
    async get(brandId) {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('brand_id', brandId)
        .single()
      if (error && error.code !== 'PGRST116') throw error
      return data
    },

    async upsert(schedule) {
      const { data, error } = await supabase
        .from('schedules')
        .upsert(schedule)
        .select()
        .single()
      if (error) throw error
      return data
    }
  },

  // Alerts
  alerts: {
    async get(brandId) {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('brand_id', brandId)
        .single()
      if (error && error.code !== 'PGRST116') throw error
      return data
    },

    async upsert(alert) {
      const { data, error } = await supabase
        .from('alerts')
        .upsert(alert)
        .select()
        .single()
      if (error) throw error
      return data
    }
  }
}

export default supabase
