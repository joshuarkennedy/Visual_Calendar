import { useApp } from '../context/AppContext'
import type { CalendarEvent } from '../types'
import { eventsForDay } from '../utils/events'
import { useNow } from '../utils/useNow'
import {
  formatMinutes,
  isSameDay,
  nowMinutes as nowMins,
  toDateKey,
  WEEKDAY_LABELS,
} from '../utils/date'
import { PictureThumb } from './PictureThumb'

const HOUR_H = 64 // px per hour

/** Hour-by-hour timeline for one or more days (Day view = 1, Week view = 7). */
export function Timeline({
  days,
  onNewEvent,
  onEditEvent,
}: {
  days: Date[]
  onNewEvent: (dateKey: string, startMinutes: number) => void
  onEditEvent: (e: CalendarEvent) => void
}) {
  const { events, getPicture, settings } = useApp()
  const now = useNow(30_000)
  const startHour = settings.dayStartHour
  const endHour = settings.dayEndHour
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i)
  const totalMinutes = (endHour - startHour) * 60
  const bodyHeight = hours.length * HOUR_H

  const minuteToY = (m: number) => ((m - startHour * 60) / 60) * HOUR_H

  return (
    <div className="timeline-scroll">
      <div
        className="timeline"
        style={{ ['--hour-h' as string]: `${HOUR_H}px`, minWidth: days.length > 1 ? 640 : undefined }}
      >
        <div
          className="tl-head"
          style={{ gridTemplateColumns: `64px repeat(${days.length}, 1fr)` }}
        >
          <div className="tl-corner" />
          {days.map((d) => (
            <div
              key={toDateKey(d)}
              className={`tl-daylabel ${isSameDay(d, now) ? 'today' : ''}`}
            >
              {WEEKDAY_LABELS[d.getDay()]}
              <div style={{ fontSize: 22 }}>{d.getDate()}</div>
            </div>
          ))}
        </div>

        <div
          className="tl-body"
          style={{
            gridTemplateColumns: `64px repeat(${days.length}, 1fr)`,
            height: bodyHeight,
          }}
        >
          {/* hour labels */}
          <div className="tl-hourcol">
            {hours.map((h) => (
              <div key={h} className="tl-hour">
                {formatMinutes(h * 60, settings.clock24h)}
              </div>
            ))}
          </div>

          {/* day columns */}
          {days.map((d) => {
            const key = toDateKey(d)
            const dayEvents = eventsForDay(events, d)
            const showNow = isSameDay(d, now)
            const nowY = minuteToY(nowMins(now))
            const nowVisible = nowMins(now) >= startHour * 60 && nowMins(now) <= endHour * 60
            return (
              <div key={key} className="tl-daycol">
                {hours.map((h) => (
                  <button
                    key={h}
                    className="hourline btn ghost"
                    style={{ width: '100%', borderRadius: 0, padding: 0 }}
                    onClick={() => onNewEvent(key, h * 60)}
                    aria-label={`Add event at ${formatMinutes(h * 60, settings.clock24h)}`}
                  />
                ))}

                {dayEvents.map((e) => {
                  const top = minuteToY(e.startMinutes)
                  const height = Math.max(
                    28,
                    (Math.min(e.durationMinutes, totalMinutes) / 60) * HOUR_H - 4,
                  )
                  return (
                    <button
                      key={e.id}
                      className="tl-event"
                      style={{ top, height, ['--evt' as string]: e.color }}
                      onClick={() => onEditEvent(e)}
                      aria-label={`${e.title || 'Event'} at ${formatMinutes(e.startMinutes, settings.clock24h)}`}
                    >
                      <PictureThumb picture={getPicture(e.pictureId)} />
                      <span className="lbl">
                        {e.title || getPicture(e.pictureId)?.name}
                        <small>{formatMinutes(e.startMinutes, settings.clock24h)}</small>
                      </span>
                    </button>
                  )
                })}

                {showNow && nowVisible && (
                  <div className="now-line" style={{ top: nowY }} aria-label="Now" />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
