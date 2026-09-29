import { useRef, useState } from 'react'
import { ProgressRing, Stars } from './bits'
import { IconPlus, IconTrash, IconX } from './icons'
import { todayKey, formatLong, addDays, parseKey, isToday } from '../lib/dates'

function ReviewModal({ day, completion, onCancel, onSave }) {
  const [rating, setRating] = useState(day.review?.rating ?? 0)
  const [note, setNote] = useState(day.review?.note ?? '')

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="End of day review">
      <div className="modal">
        <button className="modal-close" onClick={onCancel} aria-label="Close review">
          <IconX />
        </button>
        <h2 className="modal-title">End of day review</h2>
        <p className="modal-sub">{formatLong(day.key)}</p>

        <div className="review-ring">
          <ProgressRing value={completion} size={110}>
            <span className="ring-pct">{completion}%</span>
            <span className="ring-cap">completed</span>
          </ProgressRing>
        </div>

        <p className="review-question">How did the day feel?</p>
        <Stars value={rating} onChange={setRating} />

        <textarea
          className="review-note"
          rows={3}
          placeholder="Optional note — wins, blockers, thoughts…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div className="modal-actions">
          <button className="btn ghost" onClick={onCancel}>Cancel</button>
          <button
            className="btn primary"
            onClick={() => onSave(rating, note.trim())}
            disabled={rating === 0}
            title={rating === 0 ? 'Pick a star rating first' : undefined}
          >
            Save review
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PlanView({ days, mutateDay }) {
  const [selectedKey, setSelectedKey] = useState(todayKey)
  const [draft, setDraft] = useState('')
  const [reviewing, setReviewing] = useState(false)
  const inputRef = useRef(null)

  const day = days[selectedKey] ?? { tasks: [], review: null }
  const done = day.tasks.filter((t) => t.done).length
  const completion = day.tasks.length === 0 ? 0 : Math.round((done / day.tasks.length) * 100)

  const shiftDay = (delta) => {
    setSelectedKey((prev) => {
      const next = parseKey(prev)
      next.setDate(next.getDate() + delta)
      return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`
    })
  }

  const addTask = (event) => {
    event.preventDefault()
    const trimmed = draft.trim()
    if (!trimmed) return
    mutateDay(selectedKey, (d) => ({
      ...d,
      tasks: [...d.tasks, { id: crypto.randomUUID(), text: trimmed, done: false }],
    }))
    setDraft('')
    inputRef.current?.focus()
  }

  const toggleTask = (id) => {
    mutateDay(selectedKey, (d) => ({
      ...d,
      tasks: d.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    }))
  }

  const deleteTask = (id) => {
    mutateDay(selectedKey, (d) => ({
      ...d,
      tasks: d.tasks.filter((t) => t.id !== id),
    }))
  }

  const saveReview = (rating, note) => {
    mutateDay(selectedKey, (d) => ({ ...d, review: { rating, note } }))
    setReviewing(false)
  }

  return (
    <section className="view">
      {/* Day selector */}
      <div className="day-nav card">
        <button className="icon-btn" onClick={() => shiftDay(-1)} aria-label="Previous day">‹</button>
        <div className="day-title">
          <span className="day-name">{formatLong(selectedKey)}</span>
          {isToday(selectedKey) && <span className="day-badge">Today</span>}
        </div>
        <button className="icon-btn" onClick={() => shiftDay(1)} aria-label="Next day">›</button>
        <button
          className="btn ghost small jump-today"
          onClick={() => setSelectedKey(todayKey())}
          disabled={isToday(selectedKey)}
        >
          Today
        </button>
      </div>

      {/* Progress */}
      <div className="progress-row card">
        <ProgressRing value={completion} size={92} stroke={9}>
          <span className="ring-pct">{completion}%</span>
        </ProgressRing>
        <div className="progress-info">
          <span className="progress-count">
            {done} of {day.tasks.length} tasks done
          </span>
          <span className="progress-hint">
            {day.tasks.length === 0
              ? 'Add your first task below.'
              : completion === 100
                ? 'Everything is done. Great day. 🎉'
                : 'Keep going — you got this.'}
          </span>
          <button className="btn primary small" onClick={() => setReviewing(true)}>
            {day.review ? 'Edit day review' : 'End of day review'}
          </button>
        </div>
        {day.review && (
          <div className="review-summary">
            <Stars value={day.review.rating} size={16} />
            {day.review.note && <p className="review-note-text">“{day.review.note}”</p>}
          </div>
        )}
      </div>

      {/* Add task */}
      <form className="add-row" onSubmit={addTask}>
        <input
          ref={inputRef}
          className="add-input"
          type="text"
          placeholder="Add a task for this day…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          aria-label="New task"
        />
        <button className="btn primary add-task-btn" type="submit" disabled={!draft.trim()}>
          <IconPlus size={16} />
          Add
        </button>
      </form>

      {/* Tasks */}
      {day.tasks.length === 0 ? (
        <div className="empty card">
          <p className="empty-title">No tasks for this day yet</p>
          <p className="empty-sub">Create this day by adding your first task above.</p>
        </div>
      ) : (
        <ul className="task-list card">
          {day.tasks.map((task) => (
            <li key={task.id} className={`task${task.done ? ' done' : ''}`}>
              <label className="task-main">
                <input
                  type="checkbox"
                  className="task-check"
                  checked={task.done}
                  onChange={() => toggleTask(task.id)}
                />
                <span className="task-text">{task.text}</span>
              </label>
              <button
                type="button"
                className="delete-btn"
                onClick={() => deleteTask(task.id)}
                aria-label={`Delete "${task.text}"`}
              >
                <IconTrash />
              </button>
            </li>
          ))}
        </ul>
      )}

      {reviewing && (
        <ReviewModal
          day={{ key: selectedKey, review: day.review }}
          completion={completion}
          onCancel={() => setReviewing(false)}
          onSave={saveReview}
        />
      )}
    </section>
  )
}
