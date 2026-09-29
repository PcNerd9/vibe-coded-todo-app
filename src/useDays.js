import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'dayflow.days.v1'

// Boundary validation — localStorage is untrusted input.
function loadDays() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('stored value is not an object')
    }
    const clean = {}
    for (const [key, value] of Object.entries(parsed)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) continue
      if (value === null || typeof value !== 'object') continue
      const tasks = Array.isArray(value.tasks)
        ? value.tasks.filter(
            (t) =>
              t !== null &&
              typeof t === 'object' &&
              typeof t.id === 'string' &&
              typeof t.text === 'string' &&
              typeof t.done === 'boolean',
          )
        : []
      const review =
        value.review && typeof value.review === 'object' ? value.review : null
      clean[key] = { tasks, review }
    }
    return clean
  } catch (err) {
    console.warn('DayFlow: could not read saved data, starting fresh.', err)
    return {}
  }
}

export function useDays() {
  const [days, setDays] = useState(loadDays)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(days))
    } catch (err) {
      console.warn('DayFlow: could not save (storage full or unavailable).', err)
    }
  }, [days])

  const mutateDay = useCallback((key, updater) => {
    setDays((prev) => ({
      ...prev,
      [key]: updater(prev[key] ?? { tasks: [], review: null }),
    }))
  }, [])

  return { days, mutateDay }
}
