import { useApp } from '../context/AppContext'
import type { DisplayMode } from '../types'
import { Modal } from './Modal'

const DISPLAY_MODES: { mode: DisplayMode; label: string }[] = [
  { mode: 'colorbar', label: 'Color bar' },
  { mode: 'countdown', label: 'Countdown' },
  { mode: 'clock', label: 'Clock' },
]

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const { settings, updateSettings } = useApp()

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
