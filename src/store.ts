import { get, set } from 'idb-keyval'
import type { CalendarEvent, Picture, Settings } from './types'
import { DEFAULT_SETTINGS } from './types'

/**
 * Persistence layer. Everything is stored locally in the browser (IndexedDB)
 * so no data ever leaves the device — important for a tool used by vulnerable
 * people. Uploaded photos are kept as data URLs alongside the records.
 */

const KEYS = {
  events: 'vc:events',
  pictures: 'vc:pictures', // user-uploaded + customized pictures only
  hiddenBuiltIns: 'vc:hiddenBuiltIns',
  settings: 'vc:settings',
} as const

export async function loadEvents(): Promise<CalendarEvent[]> {
  return (await get<CalendarEvent[]>(KEYS.events)) ?? []
}
export async function saveEvents(events: CalendarEvent[]): Promise<void> {
  await set(KEYS.events, events)
}

/** Only user-created pictures live here; built-ins come from code. */
export async function loadUserPictures(): Promise<Picture[]> {
  return (await get<Picture[]>(KEYS.pictures)) ?? []
}
export async function saveUserPictures(pictures: Picture[]): Promise<void> {
  await set(KEYS.pictures, pictures)
}

export async function loadHiddenBuiltIns(): Promise<string[]> {
  return (await get<string[]>(KEYS.hiddenBuiltIns)) ?? []
}
export async function saveHiddenBuiltIns(ids: string[]): Promise<void> {
  await set(KEYS.hiddenBuiltIns, ids)
}

export async function loadSettings(): Promise<Settings> {
  return { ...DEFAULT_SETTINGS, ...(await get<Settings>(KEYS.settings)) }
}
export async function saveSettings(settings: Settings): Promise<void> {
  await set(KEYS.settings, settings)
}

/** Generate a stable-ish unique id without extra dependencies. */
export function uid(prefix = 'id'): string {
  const rand = Math.random().toString(36).slice(2, 10)
  return `${prefix}-${Date.now().toString(36)}-${rand}`
}
