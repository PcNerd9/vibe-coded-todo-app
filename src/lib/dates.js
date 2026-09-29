// Pure date helpers — no React, no storage, no side effects.

// Local date key, NOT toISOString (which is UTC — would shift the day
// for anyone west of GMT in the evening).
export function dateKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayKey() {
  return dateKey(new Date())
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function parseKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function formatLong(key) {
  const date = parseKey(key)
  return `${DAY_NAMES[date.getDay()]}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`
}

export function formatShort(key) {
  const date = parseKey(key)
  return `${MONTH_NAMES[date.getMonth()].slice(0, 3)} ${date.getDate()}`
}

export function weekdayShort(key) {
  return DAY_NAMES[parseKey(key).getDay()].slice(0, 3)
}

export function isToday(key) {
  return key === todayKey()
}

// Sunday-based weeks, consistent everywhere (weeks view + custom picker).
export function startOfWeek(date) {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  return d
}

export function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

export function rangeFromKeys(startKey, endKey) {
  const keys = []
  let cur = parseKey(startKey)
  const end = parseKey(endKey)
  while (cur <= end) {
    keys.push(dateKey(cur))
    cur = addDays(cur, 1)
  }
  return keys
}

export function lastNDaysKeys(n, endKey = todayKey()) {
  return rangeFromKeys(dateKey(addDays(parseKey(endKey), -(n - 1))), endKey)
}

export function weekKeys(offset = 0) {
  const ref = addDays(startOfWeek(new Date()), offset * 7)
  return rangeFromKeys(dateKey(ref), dateKey(addDays(ref, 6)))
}

export function monthKeys(offset = 0) {
  const now = new Date()
  const ref = new Date(now.getFullYear(), now.getMonth() + offset, 1)
  const daysInMonth = new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate()
  return rangeFromKeys(
    dateKey(ref),
    dateKey(new Date(ref.getFullYear(), ref.getMonth(), daysInMonth)),
  )
}
