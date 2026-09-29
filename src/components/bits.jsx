// Presentational pieces shared across views.

export function Stars({ value = 0, onChange, size = 26 }) {
  return (
    <div className={onChange ? 'stars interactive' : 'stars'} role="img" aria-label={`${value} of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          className={`star${n <= value ? ' filled' : ''}`}
          style={{ width: size, height: size }}
          onClick={onChange ? () => onChange(n) : undefined}
          aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
        >
          <svg viewBox="0 0 24 24" width="100%" height="100%">
            <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.05 1.1-6.5-4.7-4.6 6.5-.95z" />
          </svg>
        </button>
      ))}
    </div>
  )
}

export function ProgressRing({ value, size = 120, stroke = 10, children }) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.min(100, Math.max(0, value))
  const offset = circumference * (1 - clamped / 100)
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="ring-svg">
        <circle
          className="ring-track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
        />
        <circle
          className="ring-progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="ring-label">{children}</div>
    </div>
  )
}

// Stacked bar chart in pure CSS — completed (accent) under open (muted).
export function BarChart({ data, labelFor }) {
  const max = Math.max(1, ...data.map((d) => d.completed + d.open))
  const compact = data.length > 16
  return (
    <div className={`barchart${compact ? ' compact' : ''}`}>
      {data.map((d) => {
        const total = d.completed + d.open
        const hCompleted = (d.completed / max) * 100
        const hOpen = (d.open / max) * 100
        return (
          <div key={d.key} className="bar-col" title={`${labelFor(d.key)} — ${d.completed} done, ${d.open} open`}>
            <div className="bar-stack">
              {total > 0 ? (
                <>
                  <div className="bar-seg open" style={{ height: `${hOpen}%` }} />
                  <div className="bar-seg completed" style={{ height: `${hCompleted}%` }} />
                </>
              ) : (
                <div className="bar-seg zero" style={{ height: 3 }} />
              )}
            </div>
            <span className="bar-label">{labelFor(d.key)}</span>
          </div>
        )
      })}
    </div>
  )
}

export function StatCard({ label, value, sub, tone }) {
  return (
    <div className={`stat-card${tone ? ` tone-${tone}` : ''}`}>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
      {sub && <span className="stat-sub">{sub}</span>}
    </div>
  )
}
