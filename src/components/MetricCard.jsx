import React from 'react'

export default function MetricCard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  color = '#818cf8', 
  icon,
  size = 'normal'
}) {
  const isSmall = size === 'small'

  return (
    <div 
      className="card relative overflow-hidden"
      style={{ padding: isSmall ? '18px' : '24px' }}
    >
      {/* Background Glow */}
      <div 
        className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 100% 0%, ${color}15 0%, transparent 70%)`
        }}
      />

      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-white/50 text-xs font-semibold uppercase tracking-wide">
          {title}
        </span>
        {icon && <span className="text-xl opacity-60">{icon}</span>}
      </div>

      {/* Value */}
      <div 
        className={`font-extrabold font-mono tracking-tight ${
          isSmall ? 'text-3xl' : 'text-4xl'
        }`}
        style={{ letterSpacing: '-2px' }}
      >
        {value}
      </div>

      {/* Subtitle & Trend */}
      {(subtitle || trend !== undefined) && (
        <div className="flex items-center gap-2 mt-3">
          {trend !== undefined && (
            <span 
              className={`text-sm font-semibold flex items-center gap-1 px-2 py-0.5 rounded-md ${
                trend >= 0 
                  ? 'bg-green-500/15 text-green-400' 
                  : 'bg-red-500/15 text-red-400'
              }`}
            >
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
            </span>
          )}
          {subtitle && (
            <span className="text-white/40 text-xs">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  )
}
