/**
 * Audio cues for the viewer: a gentle chime plus spoken labels using the
 * browser's built-in Speech Synthesis. Everything runs on-device — no network,
 * nothing leaves the browser, consistent with the app's privacy stance.
 */

let audioCtx: AudioContext | null = null

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

/* ---- speaking-state store (drives the "speaking" visual pulse) ---- */
let speaking = false
let fallbackTimer: number | undefined
const speakingListeners = new Set<() => void>()

export function getSpeaking(): boolean {
  return speaking
}
export function subscribeSpeaking(fn: () => void): () => void {
  speakingListeners.add(fn)
  return () => speakingListeners.delete(fn)
}
function setSpeaking(v: boolean): void {
  if (speaking === v) return
  speaking = v
  speakingListeners.forEach((l) => l())
}

function getCtx(): AudioContext | null {
  const Ctx =
    typeof window !== 'undefined'
      ? window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext
      : undefined
  if (!Ctx) return null
  if (!audioCtx) audioCtx = new Ctx()
  return audioCtx
}

/** A short rising three-note chime to draw attention before a spoken label. */
export function playChime(): void {
  const ctx = getCtx()
  if (!ctx) return
  try {
    if (ctx.state === 'suspended') void ctx.resume()
    const start = ctx.currentTime
    const notes = [523.25, 659.25, 783.99] // C5, E5, G5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      const t = start + i * 0.15
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.22, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0008, t + 0.4)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.45)
    })
  } catch {
    // Audio is a nicety; never let it break the UI.
  }
}

/** Speak a short phrase aloud. Cancels anything already speaking. */
export function speak(text: string, opts: { rate?: number; pitch?: number } = {}): void {
  if (!isSpeechSupported() || !text.trim()) return
  try {
    const synth = window.speechSynthesis
    synth.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate = opts.rate ?? 0.9 // a little slower aids comprehension
    u.pitch = opts.pitch ?? 1
    u.lang = 'en-US'

    // Drive the speaking pulse. We flip it on optimistically and use an
    // estimated duration as a fallback, because onstart/onend are flaky or
    // absent on some browsers; the real events override the estimate.
    setSpeaking(true)
    window.clearTimeout(fallbackTimer)
    const estMs = Math.min(9000, 700 + text.length * 85)
    fallbackTimer = window.setTimeout(() => setSpeaking(false), estMs)
    u.onstart = () => setSpeaking(true)
    u.onend = () => {
      window.clearTimeout(fallbackTimer)
      setSpeaking(false)
    }
    u.onerror = () => {
      window.clearTimeout(fallbackTimer)
      setSpeaking(false)
    }

    synth.speak(u)
  } catch {
    setSpeaking(false)
    // ignore — speech is best-effort
  }
}

/**
 * Full "an event just started" cue: chime, then speak the label a moment
 * later so the two don't overlap. Used when a task becomes the current event.
 */
export function announce(label: string, opts?: { rate?: number }): void {
  playChime()
  const phrase = label.trim() ? `It's time. ${label.trim()}.` : 'Time for your next activity.'
  window.setTimeout(() => speak(phrase, opts), 650)
}

/** Stop any in-progress speech (e.g. when leaving the viewer). */
export function stopSpeaking(): void {
  window.clearTimeout(fallbackTimer)
  setSpeaking(false)
  if (isSpeechSupported()) {
    try {
      window.speechSynthesis.cancel()
    } catch {
      // ignore
    }
  }
}
