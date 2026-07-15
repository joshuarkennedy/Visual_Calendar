/** Small, dependency-free date helpers. All dates are handled in local time. */

const DAY_MS = 24 * 60 * 60 * 1000

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/** Format a Date as a local 'YYYY-MM-DD' key. */
export function toDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Parse a 'YYYY-MM-DD' key into a local Date at midnight. */
export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * DAY_MS)
}

export function startOfWeek(d: Date): Date {
  const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  return addDays(copy, -copy.getDay())
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

export function isSameDay(a: Date, b: Date): boolean {
  return toDateKey(a) === toDateKey(b)
}

/** Minutes from local midnight for "now". */
export function nowMinutes(d: Date = new Date()): number {
  return d.getHours() * 60 + d.getMinutes()
}

/** Format minutes-from-midnight as a clock string. */
export function formatMinutes(minutes: number, clock24h = false): string {
  const whole = Math.floor(minutes)
  let h = Math.floor(whole / 60) % 24
  const m = whole % 60
  if (clock24h) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }
  const suffix = h >= 12 ? 'PM' : 'AM'
  h = h % 12
  if (h === 0) h = 12
  return `${h}:${String(m).padStart(2, '0')} ${suffix}`
}

/** Human "3 hr 20 min", "45 min", "in a moment". */
export function formatDuration(mins: number): string {
  if (mins <= 0) return 'now'
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h} hr`
  return `${h} hr ${m} min`
}

/** Build the 6-week (42 cell) grid of Dates for a month view. */
export function monthGrid(monthDate: Date): Date[] {
  const first = startOfMonth(monthDate)
  const gridStart = startOfWeek(first)
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i))
}
