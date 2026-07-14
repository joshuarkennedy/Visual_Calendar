import type { CalendarEvent } from '../types'
import { fromDateKey, toDateKey } from './date'

/** Does a (possibly recurring) event occur on the given date? */
export function occursOn(event: CalendarEvent, date: Date): boolean {
  const key = toDateKey(date)
  if (event.date === key) return true
  // Recurrence only projects forward from the event's anchor date.
  const anchor = fromDateKey(event.date)
  if (date < anchor) return false
  switch (event.recurrence) {
    case 'daily':
      return true
    case 'weekdays': {
      const dow = date.getDay()
      return dow >= 1 && dow <= 5
    }
    case 'weekly':
      return date.getDay() === anchor.getDay()
    case 'none':
    default:
      return false
  }
}

/**
 * All event-instances for a given day, sorted by start time.
 * Recurring events are returned with their `date` normalized to that day so
 * "done" and editing act on the concrete day being viewed.
 */
export function eventsForDay(
  events: CalendarEvent[],
  date: Date,
): CalendarEvent[] {
  const key = toDateKey(date)
  return events
    .filter((e) => occursOn(e, date))
    .map((e) => (e.date === key ? e : { ...e, date: key }))
    .sort((a, b) => a.startMinutes - b.startMinutes)
}

export interface DayContext {
  /** Event happening right now (start <= now < end), if any. */
  current: CalendarEvent | null
  /** The next event that hasn't started yet. */
  next: CalendarEvent | null
  /** Everything today, sorted. */
  all: CalendarEvent[]
}

/** Figure out what's happening now / next among a day's events. */
export function dayContext(
  dayEvents: CalendarEvent[],
  nowMins: number,
): DayContext {
  let current: CalendarEvent | null = null
  let next: CalendarEvent | null = null
  for (const e of dayEvents) {
    const end = e.startMinutes + e.durationMinutes
    if (nowMins >= e.startMinutes && nowMins < end) {
      // Prefer the event that ends soonest as "current".
      if (!current || end < current.startMinutes + current.durationMinutes) {
        current = e
      }
    } else if (e.startMinutes > nowMins) {
      if (!next || e.startMinutes < next.startMinutes) next = e
    }
  }
  return { current, next, all: dayEvents }
}
