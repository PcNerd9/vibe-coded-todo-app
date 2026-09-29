// Pure statistics — computed from days state, trivially testable.

export function statsForRange(days, keys) {
  let completed = 0
  let total = 0
  let reviewCount = 0
  let ratingSum = 0

  for (const key of keys) {
    const day = days[key]
    if (!day) continue
    for (const t of day.tasks) {
      total++
      if (t.done) completed++
    }
    if (day.review && typeof day.review.rating === 'number') {
      reviewCount++
      ratingSum += day.review.rating
    }
  }

  return {
    total,
    completed,
    open: total - completed,
    completionRate: total === 0 ? 0 : Math.round((completed / total) * 100),
    reviewCount,
    avgRating: reviewCount === 0 ? 0 : ratingSum / reviewCount,
  }
}

// Every task with its owning date, flattened across the range.
export function tasksInRange(days, keys) {
  const tasks = []
  for (const key of keys) {
    const day = days[key]
    if (!day) continue
    for (const t of day.tasks) tasks.push({ ...t, dateKey: key })
  }
  return tasks
}

export function openTasksInRange(days, keys) {
  return tasksInRange(days, keys).filter((t) => !t.done)
}

// Per-day counts for bar charts.
export function dailyCounts(days, keys) {
  return keys.map((key) => {
    const day = days[key]
    let completed = 0
    let open = 0
    if (day) {
      for (const t of day.tasks) (t.done ? completed++ : open++)
    }
    return { key, completed, open, hasData: Boolean(day) }
  })
}

export function reviewsInRange(days, keys) {
  const reviews = []
  for (const key of keys) {
    const day = days[key]
    if (day?.review) reviews.push({ dateKey: key, ...day.review })
  }
  return reviews.reverse() // most recent first
}
