import React from 'react'

// Minimal SVG Icons - 1.5px stroke weight
export const Icons = {
  chart: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 20V10M12 20V4M6 20v-6"/>
    </svg>
  ),
  barChart: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
    </svg>
  ),
  trophy: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4a2 2 0 01-2-2V5a2 2 0 012-2h2m12 6h2a2 2 0 002-2V5a2 2 0 00-2-2h-2M6 9V5a2 2 0 012-2h8a2 2 0 012 2v4m-12 0a6 6 0 006 6m6-6a6 6 0 01-6 6m0 0v4m-3 0h6"/>
    </svg>
  ),
  eye: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  eyeOff: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l18 18M10.5 10.677a2 2 0 002.823 2.823M7.362 7.561C5.68 8.74 4.279 10.42 3 12c1.889 2.991 5.282 6 9 6 1.55 0 3.043-.523 4.395-1.35M12 6c3.718 0 7.111 3.009 9 6-.947 1.5-2.07 2.793-3.313 3.814"/>
    </svg>
  ),
  link: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
    </svg>
  ),
  users: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  lightbulb: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6m-5 4h4M12 2a7 7 0 00-4 12.73V17a1 1 0 001 1h6a1 1 0 001-1v-2.27A7 7 0 0012 2z"/>
    </svg>
  ),
  trendUp: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
    </svg>
  ),
  trendDown: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"/>
    </svg>
  ),
  search: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <path d="M21 21l-4.35-4.35"/>
    </svg>
  ),
  target: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  star: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  ),
  zap: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  ),
  globe: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
    </svg>
  ),
  check: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
  ),
  x: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 16v-4M12 8h.01"/>
    </svg>
  ),
  alert: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"/>
    </svg>
  ),
  inbox: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-6l-2 3H10l-2-3H2"/>
      <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/>
    </svg>
  ),
}

// Bento Card Component
export function Card({ children, className = '', size = 'default', hover = false }) {
  const sizes = {
    small: 'p-4',
    default: 'p-6',
    large: 'p-8'
  }
  return (
    <div className={`
      rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm 
      ${sizes[size]} 
      ${hover ? 'hover:bg-white/[0.04] hover:border-white/[0.08] transition-colors cursor-pointer' : ''}
      ${className}
    `}>
      {children}
    </div>
  )
}

// Empty State Component
export function EmptyState({ icon, title, description, action, actionLabel }) {
  return (
    <Card size="large" className="text-center max-w-lg mx-auto">
      <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4 text-white/30">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-[14px] text-white/40 mb-4">{description}</p>
      {action && (
        <button 
          onClick={action}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-b from-amber-400 via-amber-500 to-orange-500 text-black font-medium text-[14px] hover:brightness-110 transition"
        >
          {actionLabel}
        </button>
      )}
    </Card>
  )
}

// Section Header
export function SectionHeader({ title, subtitle, action, actionLabel }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {subtitle && <p className="text-[14px] text-white/40 mt-1">{subtitle}</p>}
      </div>
      {action && (
        <button 
          onClick={action}
          className="px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/60 text-[13px] font-medium hover:bg-white/[0.08] hover:text-white transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

// Metric Card
export function MetricCard({ label, value, trend, color = 'amber', icon, subtitle }) {
  const colors = {
    amber: 'text-amber-400',
    green: 'text-emerald-400',
    red: 'text-red-400',
    blue: 'text-sky-400',
    purple: 'text-purple-400',
    white: 'text-white'
  }
  const iconColors = {
    amber: 'text-amber-400/50',
    green: 'text-emerald-400/50',
    red: 'text-red-400/50',
    blue: 'text-sky-400/50',
    purple: 'text-purple-400/50',
    white: 'text-white/30'
  }
  
  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <span className="text-[13px] text-white/40">{label}</span>
        {icon && <span className={iconColors[color]}>{icon}</span>}
      </div>
      <div className={`text-3xl font-bold ${colors[color]} font-mono`}>{value}</div>
      {subtitle && <div className="text-[12px] text-white/30 mt-1">{subtitle}</div>}
      {trend !== undefined && (
        <div className={`text-[12px] mt-2 flex items-center gap-1 ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend >= 0 ? Icons.trendUp : Icons.trendDown}
          <span>{Math.abs(trend)}% from last week</span>
        </div>
      )}
    </Card>
  )
}

// Progress Bar
export function ProgressBar({ value, max = 100, color = '#f59e0b', label, showValue = true }) {
  const percentage = Math.min((value / max) * 100, 100)
  return (
    <div>
      {(label || showValue) && (
        <div className="flex justify-between mb-2">
          {label && <span className="text-[13px] text-white/50">{label}</span>}
          {showValue && <span className="text-[13px] font-semibold font-mono" style={{ color }}>{value}%</span>}
        </div>
      )}
      <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500" 
          style={{ width: `${percentage}%`, background: color }} 
        />
      </div>
    </div>
  )
}

// Status Badge
export function StatusBadge({ status, size = 'default' }) {
  const styles = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    error: 'bg-red-500/10 text-red-400 border-red-500/20',
    info: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    neutral: 'bg-white/[0.05] text-white/50 border-white/[0.08]'
  }
  const sizes = {
    small: 'px-2 py-0.5 text-[11px]',
    default: 'px-2.5 py-1 text-[12px]',
    large: 'px-3 py-1.5 text-[13px]'
  }
  
  return (
    <span className={`inline-flex items-center rounded-lg border font-medium ${styles[status]} ${sizes[size]}`}>
      {status === 'success' && 'Active'}
      {status === 'warning' && 'Warning'}
      {status === 'error' && 'Error'}
      {status === 'info' && 'Info'}
      {status === 'neutral' && 'Inactive'}
    </span>
  )
}

// List Item
export function ListItem({ icon, title, subtitle, value, valueColor = 'white', onClick }) {
  return (
    <div 
      className={`p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center gap-4 ${onClick ? 'hover:bg-white/[0.04] cursor-pointer transition-colors' : ''}`}
      onClick={onClick}
    >
      {icon && (
        <div className="w-10 h-10 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/40 flex-shrink-0">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-[14px] text-white truncate">{title}</div>
        {subtitle && <div className="text-[12px] text-white/40 mt-0.5 truncate">{subtitle}</div>}
      </div>
      {value && (
        <div className={`text-lg font-bold font-mono text-${valueColor}`}>{value}</div>
      )}
    </div>
  )
}

export default Icons
