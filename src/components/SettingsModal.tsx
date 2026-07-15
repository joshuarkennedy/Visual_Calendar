import { useState } from 'react'
import { useApp } from '../context/AppContext'
import type { DisplayMode } from '../types'
import { Modal } from './Modal'
import { announce, isSpeechSupported } from '../utils/speech'
import {
  notificationPermission,
  notificationsSupported,
  requestNotificationPermission,
  showNotification,
} from '../utils/notify'

const DISPLAY_MODES: { mode: DisplayMode; label: string }[] = [
  { mode: 'colorbar', label: 'Color bar' },
  { mode: 'countdown', label: 'Shrinking timer' },
  { mode: 'clock', label: 'Clock' },
]

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const { settings, updateSettings } = useApp()
  const [perm, setPerm] = useState<NotificationPermission>(notificationPermission())

  async function toggleNotifications() {
    if (settings.showNotifications) {
      updateSettings({ showNotifications: false })
      return
    }
    let p = notificationPermission()
    if (p === 'default') p = await requestNotificationPermission()
    setPerm(p)
    if (p === 'granted') {
      updateSettings({ showNotifications: true })
      showNotification('Notifications on', {
        body: 'You will be reminded when it is time for an activity.',
      })
    } else {
      updateSettings({ showNotifications: false })
    }
  }

  return (
    <Modal
      title="Settings"
      onClose={onClose}
      footer={
        <>
          <div style={{ flex: 1 }} />
          <button className="btn primary" onClick={onClose}>
            Done
          </button>
        </>
      }
    >
      <div className="settings-row">
        <div>
          <strong>Default time display</strong>
          <div className="hint">Used for new events.</div>
        </div>
        <select
          value={settings.defaultDisplayMode}
          onChange={(e) => updateSettings({ defaultDisplayMode: e.target.value as DisplayMode })}
        >
          {DISPLAY_MODES.map((d) => (
            <option key={d.mode} value={d.mode}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      <div className="settings-row">
        <div>
          <strong>Announce events aloud</strong>
          <div className="hint">
            {isSpeechSupported()
              ? 'Chime + speak the event name in the Viewer when it becomes the current activity.'
              : 'Spoken audio is not supported in this browser.'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {settings.announceAloud && isSpeechSupported() && (
            <button className="btn" onClick={() => announce('Brush teeth')}>
              🔊 Test
            </button>
          )}
          <button
            className={`btn ${settings.announceAloud ? 'primary' : ''}`}
            onClick={() => updateSettings({ announceAloud: !settings.announceAloud })}
            aria-pressed={settings.announceAloud}
            disabled={!isSpeechSupported()}
          >
            {settings.announceAloud ? 'On' : 'Off'}
          </button>
        </div>
      </div>

      <div className="settings-row">
        <div>
          <strong>Show notifications</strong>
          <div className="hint">
            {!notificationsSupported()
              ? 'Notifications are not supported in this browser.'
              : perm === 'denied'
                ? 'Blocked — allow notifications for this site in your browser settings.'
                : 'A pop-up reminder when an activity starts, even if the app is in the background.'}
          </div>
        </div>
        <button
          className={`btn ${settings.showNotifications ? 'primary' : ''}`}
          onClick={toggleNotifications}
          aria-pressed={settings.showNotifications}
          disabled={!notificationsSupported() || perm === 'denied'}
        >
          {settings.showNotifications ? 'On' : perm === 'default' ? 'Turn on' : 'Off'}
        </button>
      </div>

      <div className="settings-row">
        <div>
          <strong>Viewer layout</strong>
          <div className="hint">Lay the day out as a vertical list or a horizontal row.</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`btn ${settings.viewerOrientation === 'horizontal' ? 'primary' : ''}`}
            onClick={() => updateSettings({ viewerOrientation: 'horizontal' })}
            aria-pressed={settings.viewerOrientation === 'horizontal'}
          >
            ↔ Horizontal
          </button>
          <button
            className={`btn ${settings.viewerOrientation === 'vertical' ? 'primary' : ''}`}
            onClick={() => updateSettings({ viewerOrientation: 'vertical' })}
            aria-pressed={settings.viewerOrientation === 'vertical'}
          >
            ↕ Vertical
          </button>
        </div>
      </div>

      <div className="settings-row">
        <div>
          <strong>Picture size</strong>
          <div className="hint">How big the pictures appear in the Viewer.</div>
        </div>
        <select
          value={settings.pictureSize}
          onChange={(e) =>
            updateSettings({ pictureSize: e.target.value as 'medium' | 'large' | 'huge' })
          }
        >
          <option value="medium">Medium</option>
          <option value="large">Large</option>
          <option value="huge">Huge</option>
        </select>
      </div>

      <div className="settings-row">
        <div>
          <strong>High-contrast mode</strong>
          <div className="hint">Black background, bold colors, thicker borders.</div>
        </div>
        <button
          className={`btn ${settings.highContrast ? 'primary' : ''}`}
          onClick={() => updateSettings({ highContrast: !settings.highContrast })}
          aria-pressed={settings.highContrast}
        >
          {settings.highContrast ? 'On' : 'Off'}
        </button>
      </div>

      <div className="settings-row">
        <div>
          <strong>Clock format</strong>
          <div className="hint">12-hour (AM/PM) or 24-hour.</div>
        </div>
        <button
          className="btn"
          onClick={() => updateSettings({ clock24h: !settings.clock24h })}
        >
          {settings.clock24h ? '24-hour' : '12-hour'}
        </button>
      </div>

      <div className="settings-row">
        <div>
          <strong>Day starts at</strong>
          <div className="hint">First hour shown in Day/Week.</div>
        </div>
        <select
          value={settings.dayStartHour}
          onChange={(e) => updateSettings({ dayStartHour: Number(e.target.value) })}
        >
          {Array.from({ length: 24 }, (_, i) => i).map((h) => (
            <option key={h} value={h}>
              {h}:00
            </option>
          ))}
        </select>
      </div>

      <div className="settings-row" style={{ borderBottom: 'none' }}>
        <div>
          <strong>Day ends at</strong>
          <div className="hint">Last hour shown in Day/Week.</div>
        </div>
        <select
          value={settings.dayEndHour}
          onChange={(e) => updateSettings({ dayEndHour: Number(e.target.value) })}
        >
          {Array.from({ length: 24 }, (_, i) => i + 1).map((h) => (
            <option key={h} value={h}>
              {h}:00
            </option>
          ))}
        </select>
      </div>
    </Modal>
  )
}
