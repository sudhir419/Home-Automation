// ============================================================
// DEVICE CARD
// ============================================================
import { useState } from 'react';
import {
  Lightbulb, Wind, Thermometer, Tv, Flame, Plug, Zap,
  MoreHorizontal, Calendar, AlertCircle, WifiOff, Clock,
} from 'lucide-react';
import type { Device } from '../models/types';
import { useAppStore } from '../store/appStore';
import { useBluetooth } from '../services/bluetooth/useBluetooth';
import { showToast } from './ToastContainer';

const ICON_MAP: Record<string, React.ElementType> = {
  Lightbulb, Wind, Thermometer, Tv, Flame, Plug, Zap,
};

interface Props {
  device: Device;
  showRoom?: boolean;
}

export default function DeviceCard({ device, showRoom = true }: Props) {
  const rooms = useAppStore((s) => s.rooms);
  const preferences = useAppStore((s) => s.preferences);
  const { sendDeviceCommand } = useBluetooth();
  const [optionsOpen, setOptionsOpen] = useState(false);

  const room = rooms.find((r) => r.id === device.roomId);
  const Icon = ICON_MAP[device.icon] ?? Zap;

  const isOn = device.confirmedState === 'on';
  const isPending = device.pendingState !== null;
  const isSupported = device.support === 'supported';
  const isDemo = device.support === 'demo';
  const isUnconfigured = device.support === 'unconfigured';
  const isDisconnected = device.confirmedState === 'disconnected';

  const cardStateClass =
    device.confirmedState === 'on' ? 'state-on' :
    device.confirmedState === 'error' ? 'state-error' :
    isDisconnected ? 'state-disconnected' :
    isDemo ? 'state-demo' : 'state-off';

  const iconStateClass =
    device.confirmedState === 'on' ? 'state-on' :
    isDemo ? 'state-demo' :
    isDisconnected ? 'state-disconnected' : 'state-off';

  const statusLabel =
    isPending ? 'Pending…' :
    device.confirmedState === 'on' ? 'ON' :
    device.confirmedState === 'off' ? 'OFF' :
    device.confirmedState === 'error' ? 'Error' :
    device.confirmedState === 'disconnected' ? 'Disconnected' :
    isDemo ? 'Demo Only' :
    isUnconfigured ? 'Not Configured' : 'Unknown';

  const statusClass =
    isPending ? 'pending' :
    device.confirmedState === 'on' ? 'on' :
    device.confirmedState === 'off' ? 'off' :
    device.confirmedState === 'error' ? 'error' :
    isDemo ? 'demo' :
    isUnconfigured ? 'unconfigured' : 'disconnected';

  const canControl = isSupported || (isDemo && preferences.demoMode);

  async function handleToggle() {
    if (!canControl) {
      showToast(
        isUnconfigured
          ? 'This device is not configured. Add hardware support first.'
          : 'Enable Demo Mode in Settings to simulate this device.',
        'warning'
      );
      return;
    }
    if (isPending) return;

    const targetAction = isOn ? 'off' : 'on';
    await sendDeviceCommand(device.id, targetAction, preferences.demoMode || !isSupported);
  }

  return (
    <article
      className={`device-card card-hover ${cardStateClass}`}
      aria-label={`${device.name}: ${statusLabel}`}
    >
      {/* Header */}
      <div className="device-card-header">
        <div className={`device-icon-wrap ${iconStateClass}`}>
          <Icon size={22} aria-hidden="true" />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="device-name truncate">{device.name}</p>
          {showRoom && room && (
            <p className="device-room">{room.name}</p>
          )}
        </div>

        <button
          className="btn btn-ghost btn-icon sm"
          onClick={(e) => { e.stopPropagation(); setOptionsOpen((o) => !o); }}
          aria-label={`More options for ${device.name}`}
          aria-expanded={optionsOpen}
        >
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Status badge */}
      <div className="flex items-center justify-between gap-2">
        <span className={`device-status-badge ${statusClass}`} role="status" aria-live="polite">
          {isPending && <Clock size={10} />}
          {device.confirmedState === 'error' && <AlertCircle size={10} />}
          {isDisconnected && <WifiOff size={10} />}
          {statusLabel}
        </span>

        {device.scheduleIds.length > 0 && (
          <span className="chip" title={`${device.scheduleIds.length} schedule(s)`}>
            <Calendar size={10} />
            {device.scheduleIds.length}
          </span>
        )}
      </div>

      {/* Error / warning note */}
      {device.errorMessage && !isPending && (
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', lineHeight: 1.4 }}>
          {device.errorMessage}
        </p>
      )}

      {/* Control row */}
      <div className="flex items-center justify-between gap-3" style={{ marginTop: 'auto' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {isDemo && (
            <span className="badge badge-demo" aria-label="Demo only device">Demo</span>
          )}
          {isUnconfigured && (
            <span className="badge" style={{ background: 'var(--color-state-off-bg)', color: 'var(--color-text-tertiary)' }}>
              Not configured
            </span>
          )}
        </div>

        <label
          className="toggle-switch"
          aria-label={`${isOn ? 'Turn off' : 'Turn on'} ${device.name}`}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={isOn}
            onChange={handleToggle}
            disabled={isPending || (!canControl)}
            aria-checked={isOn}
          />
          <span className="toggle-slider" />
        </label>
      </div>

      {/* Options dropdown (simple) */}
      {optionsOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'var(--space-10)',
            right: 'var(--space-4)',
            background: 'var(--color-surface-raised)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 10,
            minWidth: 160,
            overflow: 'hidden',
          }}
        >
          {[
            { label: 'View Schedule', icon: Calendar },
          ].map((action) => (
            <button
              key={action.label}
              className="btn btn-ghost"
              style={{ width: '100%', justifyContent: 'flex-start', borderRadius: 0, padding: 'var(--space-3) var(--space-4)' }}
              onClick={() => setOptionsOpen(false)}
            >
              <action.icon size={14} />
              {action.label}
            </button>
          ))}
        </div>
      )}
    </article>
  );
}
