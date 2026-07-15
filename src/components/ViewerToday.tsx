import { useApp } from '../context/AppContext'
import type { CalendarEvent } from '../types'
import { dayContext, eventsForDay } from '../utils/events'
import { useNow } from '../utils/useNow'
import { formatDuration, formatMinutes, MONTH_LABELS, WEEKDAY_LABELS } from '../utils/date'
import { PictureThumb } from './PictureThumb'
import { ColorBar, Countdown, MiniClock, PieTimer } from './TimingDisplays'
import { announce, isSpeechSupported } from '../utils/speech'
import { useSpeaking } from '../utils/useSpeaking'

/**
 * The viewer screen: a calm "what is happening now / next" display for the
 * person using the calendar. One large hero picture for the focus activity,
 * an obvious countdown to what's next, and the whole day laid out as clearly
 * divided picture cards (vertical or horizontal). No reading required.
 */
export function ViewerToday({ date }: { date: Date }) {
  const { events, getPicture, toggleDone, settings } = useApp()
  const now = useNow(1000)
  const nowM = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60

  const dayEvents = eventsForDay(events, date)
  const { current, next } = dayContext(dayEvents, nowM)
  const focus = current ?? next
  // When an event is in progress, what comes after it?
  const afterCurrent = current
    ? dayEvents.find((e) => e.startMinutes >= current.startMinutes + current.durationMinutes && !e.done) ?? null
    : null

  const labelFor = (e: CalendarEvent) => e.title || getPicture(e.pictureId)?.name || 'Activity'
  const dateLabel = `${WEEKDAY_LABELS[date.getDay()]}, ${MONTH_LABELS[date.getMonth()]} ${date.getDate()}`

  return (
    <div className={`viewer viewer-${settings.viewerOrientation} pics-${settings.pictureSize}`}>
      <header className="viewer-datebar">
        <div className="viewer-date">{dateLabel}</div>
        <div className="viewer-clock">
          {formatMinutes(now.getHours() * 60 + now.getMinutes(), settings.clock24h)}
        </div>
      </header>

      {focus ? (
        <FocusHero event={focus} isCurrent={Boolean(current)} nowM={nowM} />
      ) : (
        <div className="hero hero-empty">
          {dayEvents.length === 0 ? '🎉 Nothing planned today' : '✅ All done for today!'}
        </div>
      )}

      {/* When something is happening now, keep the next thing obvious too. */}
      {current && afterCurrent && (
        <div className="then-next">
          <span className="then-label">Then next:</span>
          <PictureThumb picture={getPicture(afterCurrent.pictureId)} className="then-pic" />
          <span className="then-title">{labelFor(afterCurrent)}</span>
          <span className="then-viz">
            <PieTimer
              fraction={Math.max(0, Math.min(1, (afterCurrent.startMinutes - nowM) / 60))}
              color={afterCurrent.color}
              size={52}
            />
            <span className="then-in">
              in {formatDuration(Math.max(0, Math.ceil(afterCurrent.startMinutes - nowM)))}
            </span>
          </span>
        </div>
      )}

      {dayEvents.length > 0 && (
        <div className="day-heading">The whole day</div>
      )}
      <div className={`day-track ${settings.viewerOrientation}`}>
        {dayEvents.map((e) => {
          const ended = nowM >= e.startMinutes + e.durationMinutes
          const isNow = Boolean(current && current.id === e.id)
          const done = e.done || ended
          const state = isNow ? 'now' : done ? 'done' : 'soon'
          return (
            <button
              key={e.id}
              className={`day-card ${state}`}
              style={{ ['--evt' as string]: e.color }}
              onClick={() => toggleDone(e.id)}
              aria-label={`${labelFor(e)} at ${formatMinutes(e.startMinutes, settings.clock24h)}${done ? ', done' : isNow ? ', happening now' : ''}. Tap to mark done.`}
            >
              {isNow && <span className="card-badge">NOW</span>}
              {done && <span className="card-check">✔</span>}
              <PictureThumb picture={getPicture(e.pictureId)} className="card-pic" />
              <div className="card-text-wrap">
                <div className="card-time">{formatMinutes(e.startMinutes, settings.clock24h)}</div>
                <div className="card-title">{labelFor(e)}</div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function FocusHero({
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
  const speaking = useSpeaking()

  const timingProps = {
    startMinutes: event.startMinutes,
    endMinutes: endM,
    nowMinutes: nowM,
    color: event.color,
    clock24h: settings.clock24h,
  }

  return (
    <div className={`hero ${speaking ? 'is-speaking' : ''}`} style={{ ['--evt' as string]: event.color }}>
      <PictureThumb picture={picture} className={`hero-pic ${speaking ? 'speaking' : ''}`} />
      <div className="hero-info">
        <div className="hero-kicker">{isCurrent ? '● Now' : 'Coming up next'}</div>
        <div className="hero-title">{label}</div>
        <div className="hero-time">
          {formatMinutes(event.startMinutes, settings.clock24h)} – {formatMinutes(endM, settings.clock24h)}
        </div>

        <div className="hero-timing">
          {event.displayMode === 'colorbar' && <ColorBar {...timingProps} />}
          {event.displayMode === 'countdown' && <Countdown {...timingProps} />}
          {event.displayMode === 'clock' && <MiniClock {...timingProps} />}
        </div>

        <div className="hero-actions">
          <button
            className="btn primary hero-btn"
            onClick={() => toggleDone(event.id)}
            style={{ ['--primary' as string]: event.color }}
          >
            {event.done ? '↩ Not done' : '✔ Done'}
          </button>
          {isSpeechSupported() && (
            <button className="btn hero-btn" onClick={() => announce(label)} aria-label={`Say ${label} aloud`}>
              🔊 Say it
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
