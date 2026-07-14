import { useApp } from '../context/AppContext'
import type { CalendarEvent } from '../types'
import { eventsForDay } from '../utils/events'
import { isSameDay, monthGrid, toDateKey, WEEKDAY_LABELS } from '../utils/date'
import { PictureThumb } from './PictureThumb'

/** Month grid. Tap empty space in a day to add; tap a picture to edit it. */
export function MonthView({
  monthDate,
  onNewEvent,
  onEditEvent,
}: {
  monthDate: Date
  onNewEvent: (dateKey: string) => void
  onEditEvent: (e: CalendarEvent) => void
}) {
  const { events, getPicture } = useApp()
  const cells = monthGrid(monthDate)
  const today = new Date()
  const viewMonth = monthDate.getMonth()

  return (
    <div style={{ overflowX: 'auto' }}>
      <div className="month-grid">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="month-dow">
            {d}
          </div>
        ))}
        {cells.map((date) => {
          const dayEvents = eventsForDay(events, date)
          const dim = date.getMonth() !== viewMonth
          const isToday = isSameDay(date, today)
          const key = toDateKey(date)
          return (
            <div
              key={key}
              className={`month-cell ${dim ? 'dim' : ''} ${isToday ? 'today' : ''}`}
            >
              <button
                className="btn ghost"
                style={{ padding: 0, minHeight: 0, justifyContent: 'space-between', width: '100%' }}
                onClick={() => onNewEvent(key)}
                aria-label={`${date.toDateString()}. Add event.`}
              >
                <span className="daynum">{date.getDate()}</span>
                <span aria-hidden style={{ color: 'var(--text-muted)', fontWeight: 800 }}>
                  ＋
                </span>
              </button>
              <div className="month-pics">
                {dayEvents.map((e) => (
                  <button
                    key={e.id}
                    className="pic"
                    style={{ ['--evt' as string]: e.color, borderLeftColor: e.color, padding: 0, border: 0 }}
                    onClick={() => onEditEvent(e)}
                    aria-label={`Edit ${e.title || 'event'}`}
                  >
                    <PictureThumb
                      picture={getPicture(e.pictureId)}
                      style={{ width: 34, height: 34, borderLeft: `5px solid ${e.color}` }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
