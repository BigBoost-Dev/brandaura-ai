import React from 'react'

const Icons = {
  alert: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 9v4m0 4h.01M12 3l9 16H3L12 3z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  check: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  lightbulb: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18h6m-5 4h4M12 2a7 7 0 00-4 12.73V17a1 1 0 001 1h6a1 1 0 001-1v-2.27A7 7 0 0012 2z"/></svg>,
  file: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>,
  link: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
  chart: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
}

const PRIORITY_STYLES = {
  high: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', icon: Icons.alert },
  medium: { bg: 'bg-sky-500/10', border: 'border-sky-500/20', text: 'text-sky-400', icon: Icons.check },
  low: { bg: 'bg-white/[0.05]', border: 'border-white/[0.08]', text: 'text-white/50', icon: Icons.lightbulb }
}

const CATEGORY_ICONS = {
  content: Icons.file,
  technical: Icons.link,
  tracking: Icons.chart
}

function Card({ children, className = '' }) {
  return <div className={`rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6 ${className}`}>{children}</div>
}

export default function OptimizationRecommendations({ recommendations = [] }) {
  if (recommendations.length === 0) {
    return (
      <Card className="text-center py-12">
        <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4 text-white/30">
          {Icons.check}
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">All Good!</h3>
        <p className="text-[14px] text-white/40">No critical recommendations at this time</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {recommendations.map((rec, i) => {
        const style = PRIORITY_STYLES[rec.priority] || PRIORITY_STYLES.medium
        const icon = CATEGORY_ICONS[rec.category] || Icons.lightbulb
        
        return (
          <div key={i} className={`rounded-xl ${style.bg} border ${style.border} p-4`}>
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 ${style.text}`}>{icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-[14px] font-medium text-white">{rec.title}</h4>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${style.bg} ${style.text} capitalize`}>
                    {rec.priority}
                  </span>
                </div>
                <p className="text-[13px] text-white/50">{rec.description}</p>
                {rec.actions && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {rec.actions.map((action, j) => (
                      <span key={j} className="text-[11px] px-2 py-1 rounded bg-white/[0.05] text-white/40">
                        {action}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
