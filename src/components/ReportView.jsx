import { useMemo, useState } from 'react'
import { BarChart, StatCard, Stars } from './bits'
import {
  statsForRange,
  dailyCounts,
  openTasksInRange,
  reviewsInRange,
} from '../lib/stats'
import {
  weekKeys,
  monthKeys,
  rangeFromKeys,
  todayKey,
  formatLong,
  formatShort,
  weekdayShort,
  parseKey,
  addDays,
  dateKey,
} from '../lib/dates'

const MODES = [
  { id: 'day', label: 'Day' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'custom', label: 'Custom' },
]

export default function ReportView({ days }) {
  const [mode, setMode] = useState('week')
  const [dayKeySel, setDayKeySel] = useState(todayKey())
  const [weekOffset, setWeekOffset] = useState(0)
  const [monthOffset, setMonthOffset] = useState(0)
  const [customStart, setCustomStart] = useState(todayKey())
  const [customEnd, setCustomEnd] = useState(todayKey())

  // Range keys derived, never stored — single source of truth.
  const keys = useMemo(() => {
    if (mode === 'day') return [dayKeySel]
    if (mode === 'week') return weekKeys(weekOffset)
    if (mode === 'month') return monthKeys(monthOffset)
    const [s, e] = customStart <= customEnd ? [customStart, customEnd] : [customEnd, customStart]
    return rangeFromKeys(s, e)
  }, [mode, dayKeySel, weekOffset, monthOffset, customStart, customEnd])

  const stats = useMemo(() => statsForRange(days, keys), [days, keys])
  const counts = useMemo(() => dailyCounts(days, keys), [days, keys])
  const openTasks = useMemo(() => openTasksInRange(days, keys), [days, keys])
  const reviews = useMemo(() => reviewsInRange(days, keys), [days, keys])

  const chartLabel =
    keys.length === 1 ? formatShort : (k) => weekdayShort(k) // compact labels for multi-day

  const rangeTitle =
    mode === 'day'
      ? formatLong(dayKeySel)
      : mode === 'week'
        ? `Week of ${formatShort(keys[0])} – ${formatShort(keys[keys.length - 1])}`
        : mode === 'month'
          ? parseKey(keys[0]).toLocaleString('en-US', { month: 'long', year: 'numeric' })
          : `${formatShort(keys[0])} – ${formatShort(keys[keys.length - 1])}`

  const shift = (delta) => {
    if (mode === 'day') {
      const d = parseKey(dayKeySel)
      d.setDate(d.getDate() + delta)
      setDayKeySel(dateKey(d))
    } else if (mode === 'week') {
      setWeekOffset((w) => w + delta)
    } else if (mode === 'month') {
      setMonthOffset((m) => m + delta)
    }
  }

  return (
    <section className="view">
      {/* Controls */}
      <div className="report-controls card">
        <div className="mode-tabs" role="tablist" aria-label="Report range">
          {MODES.map((m) => (
            <button
              key={m.id}
              role="tab"
              aria-selected={mode === m.id}
              className={`mode-tab${mode === m.id ? ' active' : ''}`}
              onClick={() => setMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="range-picker">
          {(mode === 'week' || mode === 'month' || mode === 'day') && (
            <button className="icon-btn" onClick={() => shift(-1)} aria-label="Previous period">‹</button>
          )}
          {mode === 'day' && (
            <input
              type="date"
              className="date-input"
              value={dayKeySel}
              onChange={(e) => e.target.value && setDayKeySel(e.target.value)}
              aria-label="Pick a day"
            />
          )}
          {mode === 'week' && (
            <span className="range-title">{rangeTitle}</span>
          )}
          {mode === 'month' && (
            <span className="range-title">{rangeTitle}</span>
          )}
          {(mode === 'week' || mode === 'month' || mode === 'day') && (
            <button className="icon-btn" onClick={() => shift(1)} aria-label="Next period">›</button>
          )}
        </div>

        {mode === 'custom' && (
          <div className="custom-picker">
            <input
              type="date"
              className="date-input"
              value={customStart}
              max={customEnd}
              onChange={(e) => e.target.value && setCustomStart(e.target.value)}
              aria-label="Start date"
            />
            <span className="range-sep">→</span>
            <input
              type="date"
              className="date-input"
              value={customEnd}
              min={customStart}
              onChange={(e) => e.target.value && setCustomEnd(e.target.value)}
              aria-label="End date"
            />
          </div>
        )}
      </div>

      {/* Stats */}
      <h2 className="range-heading">{rangeTitle}</h2>
      <div className="stat-grid">
        <StatCard label="Tasks created" value={stats.total} />
        <StatCard label="Completed" value={stats.completed} tone="good" />
        <StatCard label="Not completed" value={stats.open} tone="warn" />
        <StatCard
          label="Completion"
          value={`${stats.completionRate}%`}
          sub={`${stats.reviewCount} review${stats.reviewCount === 1 ? '' : 's'} · avg ${stats.avgRating.toFixed(1)}★`}
        />
      </div>

      {/* Chart */}
      <div className="card chart-card">
        <div className="chart-head">
          <h3 className="card-title">Tasks per day</h3>
          <div className="chart-legend">
            <span className="legend-dot completed" /> Completed
            <span className="legend-dot open" /> Open
          </div>
        </div>
        <BarChart data={counts} labelFor={chartLabel} />
      </div>

      {/* Open tasks */}
      <div className="card list-card">
        <h3 className="card-title">
          Not completed <span className="count-pill">{openTasks.length}</span>
        </h3>
        {openTasks.length === 0 ? (
          <p className="empty-inline">Nothing open in this range. 🎉</p>
        ) : (
          <ul className="report-task-list">
            {openTasks.map((t) => (
              <li key={t.id} className="report-task">
                <span className="report-task-date">{formatShort(t.dateKey)}</span>
                <span className="report-task-text">{t.text}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="card list-card">
          <h3 className="card-title">
            Day reviews <span className="count-pill">{reviews.length}</span>
          </h3>
          <ul className="review-list">
            {reviews.map((r) => (
              <li key={r.dateKey} className="review-item">
                <div className="review-head">
                  <span className="review-date">{formatLong(r.dateKey)}</span>
                  <Stars value={r.rating} size={14} />
                </div>
                {r.note && <p className="review-note-text">“{r.note}”</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
