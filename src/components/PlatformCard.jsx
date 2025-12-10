import React from 'react'
import { AI_PLATFORMS } from '../lib/constants'

export default function PlatformCard({ platform, score, trend, total, mentioned }) {
  const info = AI_PLATFORMS[platform] || { name: platform, color: '#f59e0b' }
  
  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `${info.color}20` }}
          >
            <svg className="w-4 h-4" style={{ color: info.color }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="11" width="18" height="10" rx="2"/>
              <circle cx="12" cy="5" r="2"/>
              <path d="M12 7v4M7 15h.01M17 15h.01"/>
            </svg>
          </div>
          <span className="text-[14px] font-medium text-white">{info.name}</span>
        </div>
      </div>
      
      <div 
        className="text-3xl font-bold font-mono mb-2"
        style={{ color: info.color }}
      >
        {score}%
      </div>
      
      <div className="flex items-center justify-between text-[12px] text-white/30">
        <span>{mentioned} of {total} tests</span>
        {trend !== undefined && (
          <span className={trend >= 0 ? 'text-emerald-400' : 'text-red-400'}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  )
}
