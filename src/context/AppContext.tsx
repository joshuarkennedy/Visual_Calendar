import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { CalendarEvent, Picture, Settings } from '../types'
import { DEFAULT_SETTINGS } from '../types'
import { BUILTIN_PICTURES } from '../data/builtinPictures'
import {
  loadEvents,
  loadHiddenBuiltIns,
  loadSettings,
  loadUserPictures,
  saveEvents,
  saveHiddenBuiltIns,
  saveSettings,
  saveUserPictures,
  uid,
} from '../store'

interface AppContextValue {
  ready: boolean

  events: CalendarEvent[]
  addEvent: (e: Omit<CalendarEvent, 'id'>) => CalendarEvent
  updateEvent: (e: CalendarEvent) => void
  deleteEvent: (id: string) => void
  toggleDone: (id: string) => void

  /** Visible pictures = built-ins (minus hidden) + user uploads. */
  pictures: Picture[]
  getPicture: (id: string) => Picture | undefined
  addPicture: (p: Omit<Picture, 'id' | 'builtIn'>) => Picture
  updatePicture: (p: Picture) => void
  deletePicture: (id: string) => void

  settings: Settings
  updateSettings: (patch: Partial<Settings>) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [userPictures, setUserPictures] = useState<Picture[]>([])
  const [hiddenBuiltIns, setHiddenBuiltIns] = useState<string[]>([])
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)

  // Initial load from IndexedDB.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [e, p, h, s] = await Promise.all([
        loadEvents(),
        loadUserPictures(),
        loadHiddenBuiltIns(),
        loadSettings(),
      ])
      if (cancelled) return
      setEvents(e)
      setUserPictures(p)
      setHiddenBuiltIns(h)
      setSettings(s)
      setReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // Persist on change (after ready, so we don't clobber during load).
  useEffect(() => {
    if (ready) void saveEvents(events)
  }, [events, ready])
  useEffect(() => {
    if (ready) void saveUserPictures(userPictures)
  }, [userPictures, ready])
  useEffect(() => {
    if (ready) void saveHiddenBuiltIns(hiddenBuiltIns)
  }, [hiddenBuiltIns, ready])
  useEffect(() => {
    if (ready) void saveSettings(settings)
  }, [settings, ready])

  const pictures = useMemo<Picture[]>(() => {
    const visibleBuiltIns = BUILTIN_PICTURES.filter(
      (p) => !hiddenBuiltIns.includes(p.id),
    )
    return [...visibleBuiltIns, ...userPictures]
  }, [userPictures, hiddenBuiltIns])

  const pictureMap = useMemo(() => {
    const m = new Map<string, Picture>()
    for (const p of BUILTIN_PICTURES) m.set(p.id, p)
    for (const p of userPictures) m.set(p.id, p)
    return m
  }, [userPictures])

  const getPicture = useCallback(
    (id: string) => pictureMap.get(id),
    [pictureMap],
  )

  const addEvent = useCallback((e: Omit<CalendarEvent, 'id'>) => {
    const created: CalendarEvent = { ...e, id: uid('evt') }
    setEvents((prev) => [...prev, created])
    return created
  }, [])

  const updateEvent = useCallback((e: CalendarEvent) => {
    setEvents((prev) => prev.map((x) => (x.id === e.id ? e : x)))
  }, [])

  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((x) => x.id !== id))
  }, [])

  const toggleDone = useCallback((id: string) => {
    setEvents((prev) =>
      prev.map((x) => (x.id === id ? { ...x, done: !x.done } : x)),
    )
  }, [])

  const addPicture = useCallback((p: Omit<Picture, 'id' | 'builtIn'>) => {
    const created: Picture = { ...p, id: uid('pic'), builtIn: false }
    setUserPictures((prev) => [...prev, created])
    return created
  }, [])

  const updatePicture = useCallback((p: Picture) => {
    if (p.builtIn) return // built-ins are immutable
    setUserPictures((prev) => prev.map((x) => (x.id === p.id ? p : x)))
  }, [])

  const deletePicture = useCallback((id: string) => {
    const builtIn = BUILTIN_PICTURES.find((p) => p.id === id)
    if (builtIn) {
      // Built-ins can't be deleted, only hidden from the bank.
      setHiddenBuiltIns((prev) => (prev.includes(id) ? prev : [...prev, id]))
      return
    }
    setUserPictures((prev) => prev.filter((x) => x.id !== id))
  }, [])

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }, [])

  const value: AppContextValue = {
    ready,
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    toggleDone,
    pictures,
    getPicture,
    addPicture,
    updatePicture,
    deletePicture,
    settings,
    updateSettings,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
