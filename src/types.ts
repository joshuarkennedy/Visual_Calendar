/**
 * Core data model for the Picture Calendar.
 *
 * The whole app is built around the idea that an "event" is primarily a
 * PICTURE, a COLOR and a TIME — text is optional and only there to help
 * caregivers. People using the viewer never need to read.
 */

/** How a single event counts down / shows its timing to the viewer. */
export type DisplayMode = 'colorbar' | 'countdown' | 'clock'

/** A picture that can be attached to events. Either a built-in icon or an upload. */
export interface Picture {
  id: string
  /** Short label for caregivers (never required for the viewer). */
  name: string
  /**
   * Kind of picture:
   *  - 'emoji'  -> `emoji` field holds a single emoji, rendered large.
   *  - 'photo'  -> `dataUrl` holds an uploaded image (data URL).
   */
  kind: 'emoji' | 'photo'
  emoji?: string
  dataUrl?: string
  /** Suggested / default color, used when the picture is first placed. */
  color: string
  /** Grouping in the picture bank, e.g. "Hygiene", "School". */
  category: string
  /** True for the bundled starter set (cannot be deleted, only hidden). */
  builtIn: boolean
}

/** How often an event repeats. */
export type Recurrence = 'none' | 'daily' | 'weekdays' | 'weekly'

export interface CalendarEvent {
  id: string
  pictureId: string
  /** Optional caregiver-facing label. */
  title: string
  /** Color bar / accent color for this event. */
  color: string
  /** Date this event is anchored to, as 'YYYY-MM-DD' (local). */
  date: string
  /** Start time in minutes from midnight (e.g. 8:30 = 510). */
  startMinutes: number
  /** Duration in minutes. */
  durationMinutes: number
  /** Per-event timing display for the viewer. */
  displayMode: DisplayMode
  recurrence: Recurrence
  /** Marked done for the day (viewer can tap to complete). */
  done?: boolean
}

export interface Settings {
  /** Global default timing display for new events. */
  defaultDisplayMode: DisplayMode
  /** Start hour shown in Day/Week timelines (0-23). */
  dayStartHour: number
  /** End hour shown in Day/Week timelines (1-24). */
  dayEndHour: number
  /** 12h or 24h clocks. */
  clock24h: boolean
  /** High-contrast theme toggle. */
  highContrast: boolean
  /**
   * Speak a chime + the event's name aloud in the Viewer when an event
   * becomes the current activity (and on the Speak button).
   */
  announceAloud: boolean
  /**
   * Show a system notification when an event becomes the current activity,
   * so the reminder reaches the person even when the app isn't in focus.
   * Requires the user to grant notification permission.
   */
  showNotifications: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  defaultDisplayMode: 'colorbar',
  dayStartHour: 6,
  dayEndHour: 21,
  clock24h: false,
  highContrast: false,
  announceAloud: true,
  showNotifications: false,
}

/** The accessible, high-contrast color palette used across the app. */
export interface PaletteColor {
  name: string
  value: string
}

export const PALETTE: PaletteColor[] = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Brown', value: '#a16207' },
  { name: 'Gray', value: '#64748b' },
  { name: 'Black', value: '#1f2937' },
]
