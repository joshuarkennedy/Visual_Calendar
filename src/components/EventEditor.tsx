import { useState } from 'react'
import { useApp } from '../context/AppContext'
import type { CalendarEvent, DisplayMode, Picture, Recurrence } from '../types'
import { PALETTE } from '../types'
import { Modal } from './Modal'
import { PicturePicker } from './PicturePicker'
import { PictureThumb } from './PictureThumb'

const DISPLAY_MODES: { mode: DisplayMode; label: string; icon: string }[] = [
  { mode: 'colorbar', label: 'Color bar', icon: '🟩' },
  { mode: 'countdown', label: 'Countdown', icon: '⏳' },
  { mode: 'clock', label: 'Clock', icon: '🕐' },
]

const RECURRENCES: { value: Recurrence; label: string }[] = [
  { value: 'none', label: 'Just this day' },
  { value: 'daily', label: 'Every day' },
  { value: 'weekdays', label: 'Weekdays (Mon–Fri)' },
  { value: 'weekly', label: 'Every week' },
]

const DURATIONS = [5, 10, 15, 30, 45, 60, 90, 120, 180, 240]

function minutesToTimeInput(mins: number): string {
  const h = String(Math.floor(mins / 60)).padStart(2, '0')
  const m = String(mins % 60).padStart(2, '0')
  return `${h}:${m}`
}
function timeInputToMinutes(value: string): number {
  const [h, m] = value.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

export interface EditorDraft {
  id?: string
  pictureId: string
  title: string
  color: string
  date: string
  startMinutes: number
  durationMinutes: number
  displayMode: DisplayMode
  recurrence: Recurrence
}

/** Create or edit a picture-event. */
export function EventEditor({
  draft,
  onClose,
}: {
  draft: EditorDraft
  onClose: () => void
}) {
  const { addEvent, updateEvent, deleteEvent, getPicture, settings } = useApp()
  const isEdit = Boolean(draft.id)

  const [pictureId, setPictureId] = useState(draft.pictureId)
  const [title, setTitle] = useState(draft.title)
  const [color, setColor] = useState(draft.color)
  const [date, setDate] = useState(draft.date)
  const [startMinutes, setStartMinutes] = useState(draft.startMinutes)
  const [durationMinutes, setDuration] = useState(draft.durationMinutes)
  const [displayMode, setDisplayMode] = useState<DisplayMode>(draft.displayMode)
  const [recurrence, setRecurrence] = useState<Recurrence>(draft.recurrence)
  const [pickerOpen, setPickerOpen] = useState(!draft.pictureId)

  const picture = getPicture(pictureId)

  function handlePick(p: Picture) {
    setPictureId(p.id)
    // Adopt the picture's suggested color if the user hasn't chosen one yet.
    if (!isEdit && (!color || color === draft.color)) setColor(p.color)
    if (!title) setTitle(p.name)
    setPickerOpen(false)
  }

  function handleSave() {
    if (!pictureId) {
      setPickerOpen(true)
      return
    }
    const base = {
      pictureId,
      title: title.trim(),
      color,
      date,
      startMinutes,
      durationMinutes,
      displayMode,
      recurrence,
    }
    if (draft.id) {
      const existing: CalendarEvent = { ...base, id: draft.id }
      updateEvent(existing)
    } else {
      addEvent(base)
    }
    onClose()
  }

  function handleDelete() {
    if (draft.id) deleteEvent(draft.id)
    onClose()
  }

  const footer = (
    <>
      {isEdit && (
        <button className="btn danger" onClick={handleDelete}>
          🗑 Delete
        </button>
      )}
      <div style={{ flex: 1 }} />
      <button className="btn" onClick={onClose}>
        Cancel
      </button>
      <button className="btn primary" onClick={handleSave}>
        Save
      </button>
    </>
  )

  return (
    <Modal title={isEdit ? 'Edit event' : 'New event'} onClose={onClose} footer={footer}>
      {/* Picture */}
      <div className="field">
        <label>Picture</label>
        {pickerOpen ? (
          <PicturePicker selectedId={pictureId} onSelect={handlePick} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <PictureThumb
              picture={picture}
              style={{ width: 84, height: 84, fontSize: 60, ['--evt' as string]: color }}
            />
            <button className="btn" onClick={() => setPickerOpen(true)}>
              Change picture
            </button>
          </div>
        )}
      </div>

      {/* Optional label */}
      <div className="field">
        <label htmlFor="evt-title">Label (optional — helps caregivers)</label>
        <input
          id="evt-title"
          type="text"
          value={title}
          placeholder="e.g. Brush teeth"
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Color */}
      <div className="field">
        <label>Color</label>
        <div className="chip-row">
          {PALETTE.map((c) => (
            <button
              key={c.value}
              type="button"
              className={`color-dot ${c.value === color ? 'sel' : ''}`}
              style={{ background: c.value }}
              aria-label={c.name}
              aria-pressed={c.value === color}
              onClick={() => setColor(c.value)}
            />
          ))}
        </div>
      </div>

      {/* Date + time */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div className="field" style={{ flex: 1, minWidth: 160 }}>
          <label htmlFor="evt-date">Day</label>
          <input
            id="evt-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="field" style={{ flex: 1, minWidth: 140 }}>
          <label htmlFor="evt-time">Start time</label>
          <input
            id="evt-time"
            type="time"
            value={minutesToTimeInput(startMinutes)}
            onChange={(e) => setStartMinutes(timeInputToMinutes(e.target.value))}
          />
        </div>
        <div className="field" style={{ flex: 1, minWidth: 140 }}>
          <label htmlFor="evt-dur">How long</label>
          <select
            id="evt-dur"
            value={durationMinutes}
            onChange={(e) => setDuration(Number(e.target.value))}
          >
            {DURATIONS.map((d) => (
              <option key={d} value={d}>
                {d < 60 ? `${d} min` : d % 60 === 0 ? `${d / 60} hr` : `${Math.floor(d / 60)} hr ${d % 60} min`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Timing display */}
      <div className="field">
        <label>How to show the time</label>
        <div className="chip-row">
          {DISPLAY_MODES.map((d) => (
            <button
              key={d.mode}
              type="button"
              className={`opt-chip ${d.mode === displayMode ? 'sel' : ''}`}
              aria-pressed={d.mode === displayMode}
              onClick={() => setDisplayMode(d.mode)}
            >
              <span aria-hidden>{d.icon}</span> {d.label}
            </button>
          ))}
        </div>
        <p className="hint">Default is set in Settings ({settings.defaultDisplayMode}).</p>
      </div>

      {/* Repeat */}
      <div className="field">
        <label htmlFor="evt-rec">Repeat</label>
        <select
          id="evt-rec"
          value={recurrence}
          onChange={(e) => setRecurrence(e.target.value as Recurrence)}
        >
          {RECURRENCES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>
    </Modal>
  )
}
