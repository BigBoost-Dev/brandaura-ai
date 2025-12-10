import React, { useState } from 'react'
import { useBrandsStore } from '../hooks/useStore'

const Icons = {
  clock: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  bell: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  mail: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  check: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
}

function Card({ children, className = '' }) {
  return <div className={`rounded-2xl bg-white/[0.02] border border-white/[0.06] ${className}`}>{children}</div>
}

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`w-11 h-6 rounded-full transition-colors relative ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${
        checked ? 'bg-amber-500' : 'bg-white/10'
      }`}
    >
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${checked ? 'left-6' : 'left-1'}`} />
    </button>
  )
}

export default function TrackingSettings({ brand, userId, onSave }) {
  const { updateBrand } = useBrandsStore()
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const settings = brand?.settings || {}
  
  const [alertsEnabled, setAlertsEnabled] = useState(settings.alerts?.enabled || false)
  const [alertEmail, setAlertEmail] = useState(settings.alerts?.email || '')
  const [alertThreshold, setAlertThreshold] = useState(settings.alerts?.threshold || 10)
  const [digestEnabled, setDigestEnabled] = useState(settings.digest?.enabled || false)
  const [digestFrequency, setDigestFrequency] = useState(settings.digest?.frequency || 'weekly')
  
  const handleSave = async () => {
    setSaving(true)
    setSuccess(false)
    
    try {
      await updateBrand(brand.id, {
        settings: {
          ...settings,
          alerts: { enabled: alertsEnabled, email: alertEmail, threshold: alertThreshold },
          digest: { enabled: digestEnabled, frequency: digestFrequency, email: alertEmail }
        }
      })
      setSuccess(true)
      onSave?.()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Failed to save:', err)
    } finally {
      setSaving(false)
    }
  }

  if (!brand) {
    return (
      <Card className="flex items-center justify-center h-64 max-w-2xl mx-auto">
        <p className="text-white/40 text-[14px]">Select a brand to configure settings.</p>
      </Card>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight mb-1">Settings</h1>
        <p className="text-[14px] text-white/40">Configure tracking settings for {brand.name}</p>
      </div>

      {/* Automated Schedule - Coming Soon */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/30">
              {Icons.clock}
            </div>
            <div>
              <h2 className="text-[14px] font-medium text-white">Automated Schedule</h2>
              <p className="text-[12px] text-white/40">Run tests automatically on a schedule</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Coming Soon
          </span>
        </div>
        <div className="p-4 rounded-xl bg-white/[0.02] border border-dashed border-white/[0.08]">
          <p className="text-[13px] text-white/30 text-center">
            Automated scheduling will let you run tests daily, weekly, or monthly without manual intervention.
          </p>
        </div>
      </Card>

      {/* Alerts */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/30">
              {Icons.bell}
            </div>
            <div>
              <h2 className="text-[14px] font-medium text-white">Visibility Alerts</h2>
              <p className="text-[12px] text-white/40">Get notified when visibility drops</p>
            </div>
          </div>
          <Toggle checked={alertsEnabled} onChange={setAlertsEnabled} />
        </div>
        
        {alertsEnabled && (
          <div className="space-y-4 pt-4 border-t border-white/[0.06]">
            <div>
              <label className="block text-[13px] text-white/50 mb-2">Email address</label>
              <input
                type="email"
                value={alertEmail}
                onChange={(e) => setAlertEmail(e.target.value)}
                placeholder="alerts@example.com"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-[14px] placeholder-white/30 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-[13px] text-white/50 mb-2">
                Alert when visibility drops by: <span className="text-amber-400 font-medium">{alertThreshold}%</span>
              </label>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-[11px] text-white/30 mt-1">
                <span>5%</span>
                <span>50%</span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Email Reports */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/30">
              {Icons.mail}
            </div>
            <div>
              <h2 className="text-[14px] font-medium text-white">Email Reports</h2>
              <p className="text-[12px] text-white/40">Receive periodic visibility digests</p>
            </div>
          </div>
          <Toggle checked={digestEnabled} onChange={setDigestEnabled} />
        </div>
        
        {digestEnabled && (
          <div className="pt-4 border-t border-white/[0.06]">
            <label className="block text-[13px] text-white/50 mb-3">Report frequency</label>
            <div className="flex gap-2">
              {['daily', 'weekly', 'monthly'].map(f => (
                <button
                  key={f}
                  onClick={() => setDigestFrequency(f)}
                  className={`px-4 py-2 rounded-xl text-[13px] capitalize transition-all ${
                    digestFrequency === f 
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' 
                      : 'bg-white/[0.03] text-white/50 border border-white/[0.06] hover:border-white/10'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Save */}
      <div className="flex items-center justify-end gap-3 pt-4">
        {success && (
          <span className="flex items-center gap-2 text-[13px] text-emerald-400">
            {Icons.check}
            Settings saved
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl text-[14px] font-medium bg-gradient-to-r from-amber-400 to-orange-500 text-black hover:brightness-110 disabled:opacity-50 transition"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
