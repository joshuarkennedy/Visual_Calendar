import { formatDuration } from '../utils/date'

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
      <div className="td-caption">{label}</div>
    </div>
  )
}

/**
 * A "Time Timer" pie disc: the colored slice shrinks to nothing as the moment
 * arrives. Purely visual — no numbers to read. When the color is gone, it's
 * time. For an upcoming event the disc counts down the wait (over a rolling
 * window); for an event in progress it counts down what's left of it.
 */
export function PieTimer({
  fraction,
  color,
  size = 220,
}: {
  fraction: number
  color: string
  size?: number
}) {
  const c = size / 2
  const r = c - 8
  const frac = Math.max(0, Math.min(1, fraction))

  // Angle swept clockwise from 12 o'clock.
  const angle = frac * 360
  const a1 = (-90 + angle) * (Math.PI / 180)
  const ex = c + r * Math.cos(a1)
  const ey = c + r * Math.sin(a1)
  const large = angle > 180 ? 1 : 0
  const wedge =
    frac >= 0.999
      ? null // full circle drawn separately
      : frac <= 0.001
        ? ''
        : `M ${c} ${c} L ${c} ${c - r} A ${r} ${r} 0 ${large} 1 ${ex} ${ey} Z`

  return (
    <svg width={size} height={size} className="pie-timer" role="img" aria-label="Time remaining">
      <circle cx={c} cy={c} r={r} fill="var(--surface-2)" stroke="var(--border-strong)" strokeWidth={4} />
      {/* remaining-time slice */}
      {frac >= 0.999 ? (
        <circle cx={c} cy={c} r={r} fill={color} />
      ) : (
        wedge && <path d={wedge} fill={color} />
      )}
      {/* tick marks around the face */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * 30 - 90) * (Math.PI / 180)
        return (
          <circle
            key={i}
            cx={c + Math.cos(a) * (r - 6)}
            cy={c + Math.sin(a) * (r - 6)}
            r={size > 160 ? 3.5 : 2}
            fill="var(--surface)"
          />
        )
      })}
      <circle cx={c} cy={c} r={r} fill="none" stroke="var(--border-strong)" strokeWidth={4} />
    </svg>
  )
}

/** How full the countdown disc is. Upcoming events drain over a rolling window. */
/** Minutes before an upcoming event over which the disc drains to empty. */
export const COUNTDOWN_WINDOW = 30

function countdownFraction(p: TimingProps): number {
  const t = timing(p)
  if (t.started) return t.remainingPct / 100
  // Upcoming: the disc only starts to appear/drain within the last WINDOW
  // minutes, so a visible slice means "it's getting close".
  return Math.max(0, Math.min(1, t.minsUntilStart / COUNTDOWN_WINDOW))
}

export function Countdown(p: TimingProps) {
  const t = timing(p)
  const label = t.started ? `${formatDuration(t.minsLeft)} left` : `starts in ${formatDuration(t.minsUntilStart)}`
  // Fully visual: the shrinking disc is the only signal, no numbers to read.
  return (
    <div className="td td-pie" aria-label={label}>
      <PieTimer fraction={countdownFraction(p)} color={p.color} />
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
      <div className="td-caption">{label}</div>
    </div>
  )
}
