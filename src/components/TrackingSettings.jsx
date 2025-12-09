import React, { useState, useEffect } from 'react'
import { useBrandsStore } from '../hooks/useStore'

const FREQUENCIES = [
  { id: 'daily', label: 'Daily', desc: 'Run every 24 hours' },
  { id: 'weekly', label: 'Weekly', desc: 'Run every 7 days' },
  { id: 'monthly', label: 'Monthly', desc: 'Run every 30 days' }
]

export default function TrackingSettings({ brand, userId, onSave }) {
  const { updateBrand } = useBrandsStore()
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const settings = brand?.settings || {}
  
  // Scheduling settings
  const [frequency, setFrequency] = useState(settings.frequency || 'weekly')
  const [scheduledTime, setScheduledTime] = useState(settings.scheduledTime || '09:00')
  const [timezone, setTimezone] = useState(settings.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone)
  
  // Alert settings
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
          frequency,
          scheduledTime,
          timezone,
          alerts: {
            enabled: alertsEnabled,
            email: alertEmail,
            threshold: alertThreshold
          },
          digest: {
            enabled: digestEnabled,
            frequency: digestFrequency,
            email: alertEmail
          }
        }
      })
      setSuccess(true)
      onSave?.()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Failed to save settings:', err)
    } finally {
      setSaving(false)
    }
  }
  
  // Calculate next run time
  const getNextRunTime = () => {
    const now = new Date()
    const [hours, minutes] = scheduledTime.split(':').map(Number)
    const next = new Date(now)
    next.setHours(hours, minutes, 0, 0)
    
    if (next <= now) {
      if (frequency === 'daily') next.setDate(next.getDate() + 1)
      else if (frequency === 'weekly') next.setDate(next.getDate() + 7)
      else next.setMonth(next.getMonth() + 1)
    }
    
    return next.toLocaleString()
  }

  if (!brand) {
    return (
      <div className="p-8 text-center">
        <p className="text-white/60">Select a brand to configure tracking settings.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Tracking Settings</h2>
        <p className="text-white/60">Configure automated tracking and alerts for {brand.name}</p>
      </div>

      {/* Scheduling Section */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center text-xl">⏰</div>
          <div>
            <h3 className="font-semibold">Automated Scheduling</h3>
            <p className="text-sm text-white/50">Set how often to run AI tracking</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {FREQUENCIES.map(f => (
            <button
              key={f.id}
              onClick={() => setFrequency(f.id)}
              className={`p-4 rounded-xl text-left transition border ${
                frequency === f.id 
                  ? 'bg-primary-500/20 border-primary-500/50' 
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="font-semibold mb-1">{f.label}</div>
              <div className="text-sm text-white/50">{f.desc}</div>
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/60 mb-2">Run Time</label>
            <input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-primary-500/50"
            />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-2">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-primary-500/50"
            >
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Europe/Paris">Paris (CET)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
              <option value="Asia/Kolkata">India (IST)</option>
              <option value="Australia/Sydney">Sydney (AEST)</option>
            </select>
          </div>
        </div>

        <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-emerald-400">
            <span>✓</span>
            <span className="font-medium">Next scheduled run: {getNextRunTime()}</span>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-xl">🔔</div>
            <div>
              <h3 className="font-semibold">Real-Time Alerts</h3>
              <p className="text-sm text-white/50">Get notified when visibility drops</p>
            </div>
          </div>
          <button
            onClick={() => setAlertsEnabled(!alertsEnabled)}
            className={`w-14 h-8 rounded-full transition relative ${
              alertsEnabled ? 'bg-primary-500' : 'bg-white/20'
            }`}
          >
            <div className={`w-6 h-6 rounded-full bg-white absolute top-1 transition-all ${
              alertsEnabled ? 'right-1' : 'left-1'
            }`} />
          </button>
        </div>

        {alertsEnabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">Alert Email</label>
              <input
                type="email"
                value={alertEmail}
                onChange={(e) => setAlertEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-primary-500/50"
              />
            </div>
            
            <div>
              <label className="block text-sm text-white/60 mb-2">
                Alert when visibility drops by: <span className="text-primary-400 font-bold">{alertThreshold}%</span> or more
              </label>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-white/40 mt-1">
                <span>5%</span>
                <span>25%</span>
                <span>50%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Weekly Digest Section */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-xl">📧</div>
            <div>
              <h3 className="font-semibold">Email Reports</h3>
              <p className="text-sm text-white/50">Receive regular summary reports</p>
            </div>
          </div>
          <button
            onClick={() => setDigestEnabled(!digestEnabled)}
            className={`w-14 h-8 rounded-full transition relative ${
              digestEnabled ? 'bg-primary-500' : 'bg-white/20'
            }`}
          >
            <div className={`w-6 h-6 rounded-full bg-white absolute top-1 transition-all ${
              digestEnabled ? 'right-1' : 'left-1'
            }`} />
          </button>
        </div>

        {digestEnabled && (
          <div className="flex gap-3">
            {['daily', 'weekly', 'monthly'].map(freq => (
              <button
                key={freq}
                onClick={() => setDigestFrequency(freq)}
                className={`px-4 py-2 rounded-lg capitalize transition ${
                  digestFrequency === freq
                    ? 'bg-primary-500/20 border-primary-500/50 text-primary-400'
                    : 'bg-white/5 border-white/10 text-white/60'
                } border`}
              >
                {freq}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between">
        <div>
          {success && (
            <span className="text-emerald-400 flex items-center gap-2">
              <span>✓</span> Settings saved successfully
            </span>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-gradient-to-r from-primary-500 to-purple-500 rounded-xl font-semibold hover:from-primary-600 hover:to-purple-600 transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-r from-primary-500/10 to-purple-500/10 rounded-xl p-6 border border-primary-500/20">
        <h4 className="font-semibold mb-3">💡 How Scheduled Tracking Works</h4>
        <ul className="space-y-2 text-sm text-white/70">
          <li className="flex items-start gap-2">
            <span className="text-primary-400">1.</span>
            <span>Your configured prompts run automatically against selected AI engines</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-400">2.</span>
            <span>Results are saved and compared to previous runs</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-400">3.</span>
            <span>If visibility drops below threshold, you get an instant alert</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-400">4.</span>
            <span>Weekly/daily digests summarize your AI visibility performance</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
