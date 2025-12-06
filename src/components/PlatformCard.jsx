import React from 'react'

export default function PlatformCard({ platform, stats, onClick }) {
  const score = stats?.score || 0
  const tests = stats?.tests || 0

  return (
    <div 
      onClick={onClick}
      className="card card-hover p-6 cursor-pointer relative overflow-hidden"
    >
      {/* Background Glow */}
      <div 
        className="absolute top-0 right-0 w-40 h-40 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 100% 0%, ${platform?.color}12 0%, transparent 70%)`
        }}
      />

      {/* Header */}
      <div className="flex items-center gap-4 mb-5">
        <div 
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border"
          style={{
            backgroundColor: `${platform?.color}20`,
            borderColor: `${platform?.color}40`,
            color: platform?.color
          }}
        >
          {platform?.icon}
        </div>
        <div>
          <div className="text-lg font-bold">{platform?.name}</div>
          <div className="text-white/40 text-sm">{platform?.company}</div>
        </div>
      </div>

      {/* Score */}
      <div 
        className="text-5xl font-extrabold font-mono mb-5"
        style={{ color: platform?.color, letterSpacing: '-3px' }}
      >
        {score}
        <span className="text-2xl opacity-70">%</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-white/[0.03]">
          <div className="text-white/40 text-[10px] uppercase mb-1">Tests</div>
          <div className="text-xl font-bold font-mono">{tests}</div>
        </div>
        <div className="p-3 rounded-xl bg-white/[0.03]">
          <div className="text-white/40 text-[10px] uppercase mb-1">Top Picks</div>
          <div className="text-xl font-bold font-mono text-green-400">
            {stats?.leader || 0}
          </div>
        </div>
      </div>
    </div>
  )
}
