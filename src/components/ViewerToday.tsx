import { useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import type { CalendarEvent } from '../types'
import { dayContext, eventsForDay } from '../utils/events'
import { useNow } from '../utils/useNow'
import { formatMinutes, isSameDay, MONTH_LABELS, WEEKDAY_LABELS } from '../utils/date'
import { PictureThumb } from './PictureThumb'
import { ColorBar, Countdown, MiniClock } from './TimingDisplays'
import { announce, isSpeechSupported, stopSpeaking } from '../utils/speech'

/**
 * The viewer screen for the person using the calendar: one big picture for
 * what's happening now, its timing shown as a color bar / countdown / clock,
 * and an "up next" strip. No reading required.
 */
export function ViewerToday({ date }: { date: Date }) {
  const { events, getPicture, toggleDone, settings } = useApp()
  const now = useNow(1000)
  const nowM = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60

  const dayEvents = eventsForDay(events, date)
  const { current, next } = dayContext(dayEvents, nowM)
  const focus = current ?? next

  const labelFor = (e: CalendarEvent) => e.title || getPicture(e.pictureId)?.name || 'Activity'

  // Announce aloud when an event becomes the current activity ("pushed").
  // Only for today, and only when the current event actually changes.
  const announcedRef = useRef<string | null>(null)
  const viewingToday = isSameDay(date, now)
  useEffect(() => {
    if (!viewingToday || !settings.announceAloud) {
      announcedRef.current = current?.id ?? null
      return
    }
    const id = current?.id ?? null
    if (id && id !== announcedRef.current) {
      announce(labelFor(current!))
    }
    announcedRef.current = id
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id, viewingToday, settings.announceAloud])

  // Stop any speech when leaving the viewer / unmounting.
  useEffect(() => () => stopSpeaking(), [])

  const dateLabel = `${WEEKDAY_LABELS[date.getDay()]}, ${MONTH_LABELS[date.getMonth()]} ${date.getDate()}`

  return (
    <div className="viewer">
      <div className="viewer-datebar">
        <div className="viewer-date">{dateLabel}</div>
        <div className="viewer-date" style={{ color: 'var(--text-muted)' }}>
          {formatMinutes(now.getHours() * 60 + now.getMinutes(), settings.clock24h)}
        </div>
      </div>

      {focus ? (
        <FocusCard event={focus} isCurrent={Boolean(current)} nowM={nowM} />
      ) : (
        <div className="now-card" style={{ ['--evt' as string]: 'var(--border-strong)' }}>
          <div className="now-empty" style={{ gridColumn: '1 / -1' }}>
            {dayEvents.length === 0 ? '🎉 Nothing planned today' : '✅ All done for today!'}
          </div>
        </div>
      )}

      {/* Up next strip */}
      {dayEvents.length > 0 && (
        <div className="upnext">
          <h3>Today</h3>
          <div className="upnext-row">
            {dayEvents.map((e) => {
              const started = nowM >= e.startMinutes
              const ended = nowM >= e.startMinutes + e.durationMinutes
              return (
                <button
                  key={e.id}
                  className={`upnext-item ${e.done || ended ? 'done' : ''}`}
                  style={{ ['--evt' as string]: e.color }}
                  onClick={() => toggleDone(e.id)}
                  aria-label={`${e.title || getPicture(e.pictureId)?.name} at ${formatMinutes(
                    e.startMinutes,
                    settings.clock24h,
                  )}${e.done ? ', done' : ''}`}
                >
                  <PictureThumb picture={getPicture(e.pictureId)} />
                  <div className="u-time">{formatMinutes(e.startMinutes, settings.clock24h)}</div>
                  <div className="u-title">
                    {e.done ? '✔ ' : started && !ended ? '▶ ' : ''}
                    {e.title || getPicture(e.pictureId)?.name}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function FocusCard({
  event,
  isCurrent,
  nowM,
}: {
  event: CalendarEvent
  isCurrent: boolean
  nowM: number
}) {
  const { getPicture, toggleDone, settings } = useApp()
  const picture = getPicture(event.pictureId)
  const endM = event.startMinutes + event.durationMinutes
  const label = event.title || picture?.name || 'Activity'

  const timingProps = {
    startMinutes: event.startMinutes,
    endMinutes: endM,
    nowMinutes: nowM,
    color: event.color,
    clock24h: settings.clock24h,
  }

  return (
    <div className="now-card" style={{ ['--evt' as string]: event.color }}>
      <PictureThumb picture={picture} className="big-pic" />
      <div className="now-info">
        <div className="now-kicker">{isCurrent ? 'Now' : 'Next'}</div>
        <div className="now-title">{event.title || picture?.name || 'Event'}</div>
        <div className="now-time">
          {formatMinutes(event.startMinutes, settings.clock24h)} –{' '}
          {formatMinutes(endM, settings.clock24h)}
        </div>

        <div style={{ marginTop: 6 }}>
          {event.displayMode === 'colorbar' && <ColorBar {...timingProps} />}
          {event.displayMode === 'countdown' && <Countdown {...timingProps} />}
          {event.displayMode === 'clock' && <MiniClock {...timingProps} size={140} />}
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            className="btn primary done-btn"
            onClick={() => toggleDone(event.id)}
            style={{ ['--primary' as string]: event.color }}
          >
            {event.done ? '↩ Not done' : '✔ Done'}
          </button>
          {isSpeechSupported() && (
            <button
              className="btn done-btn"
              onClick={() => announce(label)}
              aria-label={`Say ${label} aloud`}
            >
              🔊 Say it
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
