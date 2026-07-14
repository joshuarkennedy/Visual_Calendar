import { useEffect, useState } from 'react'
import { useApp } from './context/AppContext'
import type { CalendarEvent } from './types'
import { addDays, MONTH_LABELS, startOfWeek, toDateKey } from './utils/date'
import { MonthView } from './components/MonthView'
import { Timeline } from './components/Timeline'
import { ViewerToday } from './components/ViewerToday'
import { EventEditor, type EditorDraft } from './components/EventEditor'
import { PictureBankModal } from './components/PictureBankModal'
import { SettingsModal } from './components/SettingsModal'

type Mode = 'viewer' | 'caregiver'
type CalView = 'month' | 'week' | 'day'

export default function App() {
  const { ready, settings } = useApp()
  const [mode, setMode] = useState<Mode>('viewer')
  const [view, setView] = useState<CalView>('day')
  const [focusDate, setFocusDate] = useState<Date>(() => new Date())

  const [editorDraft, setEditorDraft] = useState<EditorDraft | null>(null)
  const [showBank, setShowBank] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Apply high-contrast theme to <html>.
  useEffect(() => {
    document.documentElement.dataset.contrast = settings.highContrast ? 'high' : 'normal'
  }, [settings.highContrast])

  if (!ready) {
    return <div className="empty-note">Loading…</div>
  }

  function newEvent(dateKey: string, startMinutes = 9 * 60) {
    setEditorDraft({
      pictureId: '',
      title: '',
      color: '#3b82f6',
      date: dateKey,
      startMinutes,
      durationMinutes: 30,
      displayMode: settings.defaultDisplayMode,
      recurrence: 'none',
    })
  }

  function editEvent(e: CalendarEvent) {
    setEditorDraft({
      id: e.id,
      pictureId: e.pictureId,
      title: e.title,
      color: e.color,
      date: e.date,
      startMinutes: e.startMinutes,
      durationMinutes: e.durationMinutes,
      displayMode: e.displayMode,
      recurrence: e.recurrence,
    })
  }

  function shift(dir: 1 | -1) {
    if (mode === 'viewer') {
      setFocusDate((d) => addDays(d, dir))
      return
    }
    if (view === 'month') {
      setFocusDate((d) => new Date(d.getFullYear(), d.getMonth() + dir, 1))
    } else if (view === 'week') {
      setFocusDate((d) => addDays(d, dir * 7))
    } else {
      setFocusDate((d) => addDays(d, dir))
    }
  }

  const periodLabel = getPeriodLabel(mode, view, focusDate)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(focusDate), i))

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <img src="/calendar-icon.svg" alt="" />
          Picture Calendar
        </div>

        <div className="mode-toggle" role="tablist" aria-label="Mode">
          <button
            role="tab"
            aria-selected={mode === 'viewer'}
            className={mode === 'viewer' ? 'active' : ''}
            onClick={() => setMode('viewer')}
          >
            🧑 Viewer
          </button>
          <button
            role="tab"
            aria-selected={mode === 'caregiver'}
            className={mode === 'caregiver' ? 'active' : ''}
            onClick={() => setMode('caregiver')}
          >
            🛠 Caregiver
          </button>
        </div>

        <button className="btn icon" aria-label="Picture bank" onClick={() => setShowBank(true)}>
          🖼
        </button>
        <button className="btn icon" aria-label="Settings" onClick={() => setShowSettings(true)}>
          ⚙️
        </button>
      </header>

      {/* Navigation toolbar */}
      <div className="toolbar">
        <button className="btn icon" aria-label="Previous" onClick={() => shift(-1)}>
          ◀
        </button>
        <button className="btn" onClick={() => setFocusDate(new Date())}>
          Today
        </button>
        <button className="btn icon" aria-label="Next" onClick={() => shift(1)}>
          ▶
        </button>
        <div className="period-label">{periodLabel}</div>
        <div className="spacer" />
        {mode === 'caregiver' && (
          <div className="view-tabs" role="tablist" aria-label="Calendar view">
            {(['day', 'week', 'month'] as CalView[]).map((v) => (
              <button
                key={v}
                role="tab"
                aria-selected={view === v}
                className={view === v ? 'active' : ''}
                onClick={() => setView(v)}
              >
                {v[0].toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      <main className="content">
        {mode === 'viewer' && <ViewerToday date={focusDate} />}
        {mode === 'caregiver' && view === 'month' && (
          <MonthView monthDate={focusDate} onNewEvent={newEvent} onEditEvent={editEvent} />
        )}
        {mode === 'caregiver' && view === 'week' && (
          <Timeline days={weekDays} onNewEvent={newEvent} onEditEvent={editEvent} />
        )}
        {mode === 'caregiver' && view === 'day' && (
          <Timeline days={[focusDate]} onNewEvent={newEvent} onEditEvent={editEvent} />
        )}
      </main>

      {mode === 'caregiver' && (
        <button
          className="fab"
          aria-label="Add event"
          onClick={() => newEvent(toDateKey(focusDate), 9 * 60)}
        >
          ＋
        </button>
      )}

      {editorDraft && (
        <EventEditor draft={editorDraft} onClose={() => setEditorDraft(null)} />
      )}
      {showBank && <PictureBankModal onClose={() => setShowBank(false)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  )
}

function getPeriodLabel(mode: Mode, view: CalView, date: Date): string {
  if (mode === 'viewer' || view === 'day') {
    return `${MONTH_LABELS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
  }
  if (view === 'month') {
    return `${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`
  }
  // week
  const start = startOfWeek(date)
  const end = addDays(start, 6)
  const sameMonth = start.getMonth() === end.getMonth()
  const startLbl = `${MONTH_LABELS[start.getMonth()].slice(0, 3)} ${start.getDate()}`
  const endLbl = sameMonth
    ? `${end.getDate()}`
    : `${MONTH_LABELS[end.getMonth()].slice(0, 3)} ${end.getDate()}`
  return `${startLbl} – ${endLbl}`
}
