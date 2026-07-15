import { formatDuration, formatMinutes } from '../utils/date'

/**
 * The three viewer-facing ways to show "how long until / how much is left",
 * chosen per event. They are intentionally very different from each other:
 *   - COLOR BAR  : a big bar that visibly drains from full to empty.
 *   - COUNTDOWN  : a giant number of minutes.
 *   - CLOCK      : a large analog clock with a colored wedge for the time left.
 * All three also state the remaining time in words so it is unmistakable.
 */

interface TimingProps {
  startMinutes: number
  endMinutes: number
  /** Current time in minutes from midnight (fractional for smoothness). */
  nowMinutes: number
  color: string
  clock24h: boolean
}

/** Remaining/until info shared by all three displays. */
function timing(p: TimingProps) {
  const started = p.nowMinutes >= p.startMinutes
  const total = Math.max(1, p.endMinutes - p.startMinutes)
  const minsUntilStart = Math.max(0, Math.ceil(p.startMinutes - p.nowMinutes))
  const minsLeft = Math.max(0, Math.ceil(p.endMinutes - p.nowMinutes))
  const elapsed = Math.min(total, Math.max(0, p.nowMinutes - p.startMinutes))
  const remainingPct = started
    ? Math.max(0, Math.min(100, ((total - elapsed) / total) * 100))
    : 100
  return { started, total, minsUntilStart, minsLeft, remainingPct }
}

/** A big bar that drains as the event approaches / runs. */
export function ColorBar(p: TimingProps) {
  const t = timing(p)
  const label = t.started ? `${formatDuration(t.minsLeft)} left` : `starts in ${formatDuration(t.minsUntilStart)}`
  return (
    <div className="td td-colorbar">
      <div
        className="cbar-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(t.remainingPct)}
        aria-label={label}
      >
        <div className="cbar-fill" style={{ width: `${t.remainingPct}%`, background: p.color }} />
      </div>
      <div className="td-caption" style={{ color: p.color }}>
        {label}
      </div>
    </div>
  )
}

/** A giant number of minutes remaining. */
export function Countdown(p: TimingProps) {
  const t = timing(p)
  const mins = t.started ? t.minsLeft : t.minsUntilStart
  const heading = t.started ? 'Time left' : 'Starts in'
  const big = mins >= 60 ? formatDuration(mins) : String(mins)
  const unit = mins >= 60 ? '' : mins === 1 ? 'minute' : 'minutes'
  return (
    <div className="td td-countdown" aria-label={`${heading} ${formatDuration(mins)}`}>
      <div className="cd-heading">{heading}</div>
      <div className="cd-number" style={{ color: p.color }}>
        {big}
        {unit && <span className="cd-unit">{unit}</span>}
      </div>
    </div>
  )
}

/** A large analog clock with a colored wedge showing the time remaining. */
export function MiniClock(p: TimingProps & { size?: number }) {
  const t = timing(p)
  const size = p.size ?? 220
  const c = size / 2
  const r = c - 10

  const toAngle = (mins: number) => ((mins / 60) % 12) * 30 - 90
  const hourAngle = toAngle(p.nowMinutes)
  const minuteAngle = (p.nowMinutes % 60) * 6 - 90

  const hand = (angleDeg: number, len: number) => {
    const a = (angleDeg * Math.PI) / 180
    return { x: c + Math.cos(a) * len, y: c + Math.sin(a) * len }
  }
  const h = hand(hourAngle, r * 0.5)
  const m = hand(minuteAngle, r * 0.78)

  // Wedge from "now" spanning the remaining time (up to 60 min shown).
  const targetMins = t.started ? p.endMinutes : p.startMinutes
  const remain = Math.min(60, Math.max(0, targetMins - p.nowMinutes))
  const startA = (p.nowMinutes % 60) * 6 - 90
  const endA = ((p.nowMinutes + remain) % 60) * 6 - 90
  const large = remain > 30 ? 1 : 0
  const wedge = remain > 0.2
    ? `M ${c} ${c} L ${c + Math.cos((startA * Math.PI) / 180) * r} ${c + Math.sin((startA * Math.PI) / 180) * r} A ${r} ${r} 0 ${large} 1 ${c + Math.cos((endA * Math.PI) / 180) * r} ${c + Math.sin((endA * Math.PI) / 180) * r} Z`
    : ''

  const label = t.started ? `${formatDuration(t.minsLeft)} left` : `starts in ${formatDuration(t.minsUntilStart)}`

  return (
    <div className="td td-clock">
      <svg width={size} height={size} role="img" aria-label={label}>
        <circle cx={c} cy={c} r={r} fill="var(--surface)" stroke="var(--border-strong)" strokeWidth={5} />
        {wedge && <path d={wedge} fill={p.color} opacity={0.28} />}
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * 30 - 90) * (Math.PI / 180)
          return (
            <circle
              key={i}
              cx={c + Math.cos(a) * (r - 12)}
              cy={c + Math.sin(a) * (r - 12)}
              r={size > 160 ? 4 : 2.5}
              fill="var(--text-muted)"
            />
          )
        })}
        <line x1={c} y1={c} x2={h.x} y2={h.y} stroke="var(--text)" strokeWidth={8} strokeLinecap="round" />
        <line x1={c} y1={c} x2={m.x} y2={m.y} stroke={p.color} strokeWidth={5} strokeLinecap="round" />
        <circle cx={c} cy={c} r={7} fill="var(--text)" />
      </svg>
      <div className="td-caption" style={{ color: p.color }}>
        {label} · now {formatMinutes(p.nowMinutes, p.clock24h)}
      </div>
    </div>
  )
}
