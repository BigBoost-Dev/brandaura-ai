import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../hooks/useStore'
import { supabase } from '../lib/supabase'

// Icons
const Icons = {
  back: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
  user: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  building: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16"/></svg>,
  globe: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
  lock: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  mail: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>,
  camera: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  check: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>,
  alert: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>,
  google: <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>,
  briefcase: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>,
  phone: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>,
}

// Logo component
function Logo({ size = 32 }) {
  return (
    <div 
      className="rounded-[10px] bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25"
      style={{ width: size, height: size }}
    >
      <span style={{ fontFamily: 'Sora, sans-serif', fontSize: size * 0.58 }} className="text-black font-extrabold">B</span>
    </div>
  )
}

// Input component
function Input({ label, icon, error, ...props }) {
  return (
    <div>
      {label && <label className="block text-[13px] font-medium text-white/70 mb-2">{label}</label>}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
            {icon}
          </div>
        )}
        <input
          className={`w-full bg-white/[0.03] border ${error ? 'border-red-500/50' : 'border-white/[0.08]'} rounded-xl px-4 py-3 ${icon ? 'pl-11' : ''} text-[14px] text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all`}
          {...props}
        />
      </div>
      {error && <p className="text-red-400 text-[12px] mt-1.5">{error}</p>}
    </div>
  )
}

// Card component
function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6 ${className}`}>
      {children}
    </div>
  )
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, profile, updateProfile, signOut } = useAuthStore()
  const fileInputRef = useRef(null)
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    company_name: '',
    company_website: '',
    job_title: '',
    phone: '',
  })
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)
  
  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  
  // UI state
  const [saving, setSaving] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [message, setMessage] = useState(null)
  const [passwordMessage, setPasswordMessage] = useState(null)
  
  // Check if user signed in with Google
  const isGoogleUser = user?.app_metadata?.provider === 'google' || 
                       user?.identities?.some(i => i.provider === 'google')

  // Load profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || user?.user_metadata?.full_name || '',
        company_name: profile.company_name || '',
        company_website: profile.company_website || '',
        job_title: profile.job_title || '',
        phone: profile.phone || '',
      })
      setAvatarUrl(profile.avatar_url || user?.user_metadata?.avatar_url || null)
    } else if (user) {
      setFormData(prev => ({
        ...prev,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
      }))
      setAvatarUrl(user.user_metadata?.avatar_url || user.user_metadata?.picture || null)
    }
  }, [profile, user])

  // Handle avatar upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Preview
    const reader = new FileReader()
    reader.onload = (e) => setAvatarUrl(e.target.result)
    reader.readAsDataURL(file)
    setAvatarFile(file)
  }

  // Save profile
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      let finalAvatarUrl = avatarUrl

      // Upload avatar if changed
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, { upsert: true })
        
        if (uploadError) {
          console.warn('Avatar upload failed:', uploadError)
          // Continue without avatar update
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName)
          finalAvatarUrl = publicUrl
        }
      }

      // Update profile
      await updateProfile({
        ...formData,
        avatar_url: finalAvatarUrl,
        updated_at: new Date().toISOString(),
      })

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setAvatarFile(null)
    } catch (error) {
      console.error('Failed to update profile:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }
    
    if (passwordData.newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 8 characters' })
      return
    }

    setSavingPassword(true)
    setPasswordMessage(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error

      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' })
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      console.error('Failed to change password:', error)
      setPasswordMessage({ type: 'error', text: error.message || 'Failed to change password' })
    } finally {
      setSavingPassword(false)
    }
  }

  // Get initials for avatar fallback
  const getInitials = () => {
    const name = formData.full_name || user?.email || ''
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Header */}
      <header className="border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-white/[0.05] transition-colors text-white/50 hover:text-white"
            >
              {Icons.back}
            </button>
            <Link to="/" className="flex items-center gap-3">
              <Logo size={36} />
              <div className="flex flex-col gap-0.5">
                <span style={{ fontFamily: 'Sora, sans-serif' }} className="font-bold text-[16px] text-white">BigRank AI</span>
                <span style={{ fontFamily: 'Sora, sans-serif' }} className="text-[9px] text-white/30 font-medium">by BigBoost</span>
              </div>
            </Link>
          </div>
          <Link 
            to="/dashboard"
            className="text-[14px] text-white/50 hover:text-white transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white">Profile Settings</h1>
          <p className="text-[14px] text-white/40 mt-1">Manage your account and preferences</p>
        </div>

        <div className="grid gap-6">
          {/* Profile Info Card */}
          <Card>
            <form onSubmit={handleSaveProfile}>
              <div className="flex items-start gap-6 mb-6 pb-6 border-b border-white/[0.06]">
                {/* Avatar */}
                <div className="relative group">
                  <div 
                    className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 flex items-center justify-center overflow-hidden border-2 border-white/[0.08]"
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-semibold text-amber-400">{getInitials()}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center text-white"
                  >
                    {Icons.camera}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-[15px] font-medium text-white">{formData.full_name || 'Your Name'}</h3>
                  <p className="text-[13px] text-white/40 mt-0.5">{user?.email}</p>
                  {isGoogleUser && (
                    <div className="inline-flex items-center gap-1.5 mt-2 px-2 py-1 rounded-lg bg-white/[0.05] text-[11px] text-white/50">
                      {Icons.google}
                      <span>Signed in with Google</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <Input
                  label="Full Name"
                  icon={Icons.user}
                  placeholder="John Doe"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
                
                <Input
                  label="Email"
                  icon={Icons.mail}
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="opacity-50 cursor-not-allowed"
                />
                
                <Input
                  label="Company Name"
                  icon={Icons.building}
                  placeholder="Acme Inc."
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                />
                
                <Input
                  label="Job Title"
                  icon={Icons.briefcase}
                  placeholder="Marketing Manager"
                  value={formData.job_title}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                />
                
                <Input
                  label="Company Website"
                  icon={Icons.globe}
                  placeholder="https://example.com"
                  value={formData.company_website}
                  onChange={(e) => setFormData({ ...formData, company_website: e.target.value })}
                />
                
                <Input
                  label="Phone Number"
                  icon={Icons.phone}
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              {message && (
                <div className={`mt-5 p-3 rounded-xl flex items-center gap-2 text-[13px] ${
                  message.type === 'success' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {message.type === 'success' ? Icons.check : Icons.alert}
                  {message.text}
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-medium text-[14px] text-black bg-gradient-to-b from-amber-400 via-amber-500 to-orange-500 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </Card>

          {/* Password Card - Only for non-Google users */}
          {!isGoogleUser && (
            <Card>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/40">
                  {Icons.lock}
                </div>
                <div>
                  <h3 className="text-[15px] font-medium text-white">Change Password</h3>
                  <p className="text-[12px] text-white/40">Update your password to keep your account secure</p>
                </div>
              </div>

              <form onSubmit={handleChangePassword}>
                <div className="space-y-4">
                  <Input
                    label="New Password"
                    icon={Icons.lock}
                    type="password"
                    placeholder="••••••••"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  />
                  
                  <Input
                    label="Confirm New Password"
                    icon={Icons.lock}
                    type="password"
                    placeholder="••••••••"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  />
                </div>

                {passwordMessage && (
                  <div className={`mt-5 p-3 rounded-xl flex items-center gap-2 text-[13px] ${
                    passwordMessage.type === 'success' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {passwordMessage.type === 'success' ? Icons.check : Icons.alert}
                    {passwordMessage.text}
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-medium text-[14px] text-white bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.1] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingPassword ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                        Updating...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </button>
                </div>
              </form>
            </Card>
          )}

          {/* Danger Zone */}
          <Card className="border-red-500/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-medium text-white">Sign Out</h3>
                <p className="text-[12px] text-white/40 mt-0.5">Sign out of your account on this device</p>
              </div>
              <button
                onClick={async () => {
                  await signOut()
                  navigate('/')
                }}
                className="px-4 py-2 rounded-xl text-[13px] font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
