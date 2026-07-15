import type { Picture } from '../types'

/**
 * Local system notifications via the Notifications API. These are page-driven:
 * they appear while the app is open (including in a background tab), which
 * covers the common case of the calendar running on a tablet in another app or
 * a minimized window. (True push while the app is fully closed would need a
 * service worker + push server; intentionally out of scope for this local,
 * no-server app.)
 */

export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function notificationPermission(): NotificationPermission {
  return notificationsSupported() ? Notification.permission : 'denied'
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return 'denied'
  try {
    return await Notification.requestPermission()
  } catch {
    return 'denied'
  }
}

export function showNotification(
  title: string,
  opts: { body?: string; icon?: string; tag?: string } = {},
): void {
  if (!notificationsSupported() || Notification.permission !== 'granted') return
  try {
    const n = new Notification(title, {
      body: opts.body,
      icon: opts.icon,
      tag: opts.tag ?? 'picture-calendar-event',
      // A calm, non-nagging reminder.
      requireInteraction: false,
    })
    n.onclick = () => {
      try {
        window.focus()
      } catch {
        // ignore
      }
      n.close()
    }
    window.setTimeout(() => n.close(), 15000)
  } catch {
    // Notifications are best-effort.
  }
}

/**
 * Build an icon URL for a notification from a picture: photos use their data
 * URL directly; emoji pictures are rendered onto a colored square canvas.
 */
export function pictureIconUrl(picture: Picture | undefined): string | undefined {
  if (!picture) return undefined
  if (picture.kind === 'photo' && picture.dataUrl) return picture.dataUrl
  if (picture.kind === 'emoji' && picture.emoji) {
    try {
      const size = 128
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      if (!ctx) return undefined
      ctx.fillStyle = picture.color || '#3b82f6'
      roundRect(ctx, 0, 0, size, size, 24)
      ctx.fill()
      ctx.font = `${Math.floor(size * 0.58)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(picture.emoji, size / 2, size / 2 + size * 0.04)
      return canvas.toDataURL('image/png')
    } catch {
      return undefined
    }
  }
  return undefined
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}
