import { useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { dayContext, eventsForDay } from '../utils/events'
import { useNow } from '../utils/useNow'
import { formatMinutes } from '../utils/date'
import { announce } from '../utils/speech'
import { notificationPermission, pictureIconUrl, showNotification } from '../utils/notify'

/**
 * Always-mounted watcher that fires reminders when an event becomes the
 * current activity ("pushed"): a spoken announcement and/or a system
 * notification. Kept at the app root (not the Viewer) so reminders still fire
 * while the caregiver view is open or the tab is in the background.
 */
export function Reminders() {
  const { events, settings, getPicture } = useApp()
  const now = useNow(15_000)
  const nowM = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60
  const dayEvents = eventsForDay(events, now)
  const { current } = dayContext(dayEvents, nowM)

  const firedRef = useRef<string | null>(null)

  useEffect(() => {
    const id = current?.id ?? null
    if (id && id !== firedRef.current && firedRef.current !== undefined) {
      const evt = current!
      const picture = getPicture(evt.pictureId)
      const label = evt.title || picture?.name || 'Activity'

      if (settings.announceAloud) announce(label)

      if (settings.showNotifications && notificationPermission() === 'granted') {
        showNotification(label, {
          body: `It's time — ${formatMinutes(evt.startMinutes, settings.clock24h)}`,
          icon: pictureIconUrl(picture),
        })
      }
    }
    firedRef.current = id
    // Only re-run when the current event actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id])

  return null
}
