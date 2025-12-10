import React from 'react'

export default function MetricCard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  color = '#f59e0b', 
  icon,
  isSmall = false 
}) {
  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-[13px] text-white/40">{title}</span>
        {icon && <span className="text-white/30">{icon}</span>}
      </div>
      <div 
        className={`font-bold font-mono ${isSmall ? 'text-2xl' : 'text-3xl'}`}
        style={{ color }}
      >
        {value}
      </div>
      {subtitle && (
        <div className="text-[12px] text-white/30 mt-1">{subtitle}</div>
      )}
      {trend !== undefined && (
        <div className={`text-[12px] mt-2 flex items-center gap-1 ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  )
}
