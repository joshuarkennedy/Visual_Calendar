import { formatDuration, formatMinutes } from '../utils/date'

/**
 * The three viewer-facing ways to show "how long until / how much is left",
 * chosen per event: a shrinking COLOR BAR, a COUNTDOWN, or an analog CLOCK.
 */

interface TimingProps {
  /** Whole-minute start/end of the event (minutes from midnight). */
  startMinutes: number
  endMinutes: number
  /** Current time in minutes from midnight (fractional for smoothness). */
  nowMinutes: number
  color: string
  clock24h: boolean
}

/** A bar that drains from full to empty over the event's duration. */
export function ColorBar({
  startMinutes,
  endMinutes,
  nowMinutes,
  color,
}: TimingProps) {
  const total = Math.max(1, endMinutes - startMinutes)
  const elapsed = Math.min(total, Math.max(0, nowMinutes - startMinutes))
  const remainingPct = Math.max(0, Math.min(100, ((total - elapsed) / total) * 100))
  const started = nowMinutes >= startMinutes
  return (
    <div>
      <div
        className="colorbar-wrap"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(started ? remainingPct : 100)}
        aria-label="Time remaining"
      >
        <div
          className="colorbar-fill"
          style={{ width: `${started ? remainingPct : 100}%`, ['--evt' as string]: color }}
        />
      </div>
    </div>
  )
}

/** Big text countdown: time until start, or time left if in progress. */
export function Countdown({ startMinutes, endMinutes, nowMinutes }: TimingProps) {
  const started = nowMinutes >= startMinutes
  const label = started ? 'Time left' : 'Starts in'
  const mins = started
    ? Math.max(0, Math.ceil(endMinutes - nowMinutes))
    : Math.max(0, Math.ceil(startMinutes - nowMinutes))
  return (
    <div className="countdown" aria-label={`${label} ${formatDuration(mins)}`}>
      {formatDuration(mins)}
      <small>{label}</small>
    </div>
  )
}

/** A simple analog clock showing the current time, with the start time marked. */
export function MiniClock({
  nowMinutes,
  startMinutes,
  color,
  clock24h,
  size = 120,
}: TimingProps & { size?: number }) {
  const c = size / 2
  const r = c - 6

  const hourAngle = ((nowMinutes / 60) % 12) * 30 - 90
  const minuteAngle = (nowMinutes % 60) * 6 - 90
  const startAngle = (startMinutes % 60) * 6 - 90

  const hand = (angleDeg: number, len: number) => {
    const a = (angleDeg * Math.PI) / 180
    return { x2: c + Math.cos(a) * len, y2: c + Math.sin(a) * len }
  }
  const h = hand(hourAngle, r * 0.5)
  const m = hand(minuteAngle, r * 0.78)
  const startMark = hand(startAngle, r)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <svg width={size} height={size} role="img" aria-label={`Now ${formatMinutes(nowMinutes, clock24h)}`}>
        <circle cx={c} cy={c} r={r} fill="var(--surface)" stroke="var(--border-strong)" strokeWidth={4} />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * 30 - 90) * (Math.PI / 180)
          return (
            <circle
              key={i}
              cx={c + Math.cos(a) * (r - 8)}
              cy={c + Math.sin(a) * (r - 8)}
              r={2.5}
              fill="var(--text-muted)"
            />
          )
        })}
        {/* start-time marker */}
        <line x1={c} y1={c} x2={startMark.x2} y2={startMark.y2} stroke={color} strokeWidth={4} opacity={0.35} />
        {/* hour + minute hands */}
        <line x1={c} y1={c} x2={h.x2} y2={h.y2} stroke="var(--text)" strokeWidth={6} strokeLinecap="round" />
        <line x1={c} y1={c} x2={m.x2} y2={m.y2} stroke={color} strokeWidth={4} strokeLinecap="round" />
        <circle cx={c} cy={c} r={5} fill="var(--text)" />
      </svg>
    </div>
  )
}
