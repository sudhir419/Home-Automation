// ============================================================
// DEVICE CARD — Premium with Glass ON state & Animations
// ============================================================
import { useState, useRef } from 'react';
import {
  Lightbulb, Wind, Thermometer, Tv, Flame, Plug, Zap,
  MoreHorizontal, Calendar, AlertCircle, WifiOff, Clock,
  Edit2, Trash2, X, AlertTriangle,
} from 'lucide-react';
import type { Device } from '../models/types';
import { useAppStore } from '../store/appStore';
import { useBluetooth } from '../services/bluetooth/useBluetooth';
import { showToast } from './ToastContainer';
import DeviceModal from './DeviceModal';

const ICON_MAP: Record<string, React.ElementType> = {
  Lightbulb, Wind, Thermometer, Tv, Flame, Plug, Zap,
};

/** Category → accent color pill */
const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  lighting:       { bg: 'var(--color-state-on-bg)',   color: 'var(--color-state-on)' },
  fan:            { bg: 'var(--color-info-bg)',         color: 'var(--color-on-info)' },
  climate:        { bg: 'var(--color-info-bg)',         color: 'var(--color-on-info)' },
  entertainment:  { bg: 'var(--color-highlight-light)', color: 'var(--color-highlight)' },
  'water-heating':{ bg: 'var(--color-warning-bg)',     color: 'var(--color-on-warning)' },
  outlet:         { bg: 'var(--color-state-off-bg)',   color: 'var(--color-text-secondary)' },
  other:          { bg: 'var(--color-accent-light)',   color: 'var(--color-accent)' },
};

interface Props {
  device: Device;
  showRoom?: boolean;
}

export default function DeviceCard({ device, showRoom = true }: Props) {
  const rooms = useAppStore((s) => s.rooms);
  const preferences = useAppStore((s) => s.preferences);
  const removeDevice = useAppStore((s) => s.removeDevice);
  const { sendDeviceCommand } = useBluetooth();
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [pressing, setPressing] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const room = rooms.find((r) => r.id === device.roomId);
  const Icon = ICON_MAP[device.icon] ?? Zap;

  // Long press handler: only reveals the delete option upon sustained press on appliance name
  const handlePointerDownName = (e: React.PointerEvent) => {
    // Only primary button / touch
    if (e.button !== 0) return;
    setIsLongPressing(true);
    longPressTimerRef.current = setTimeout(() => {
      setIsLongPressing(false);
      setDeleteConfirmOpen(true);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(60); } catch (_) {}
      }
    }, 550);
  };

  const handlePointerUpName = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setIsLongPressing(false);
  };

  const handleDeleteDevice = () => {
    removeDevice(device.id);
    showToast(`Deleted appliance "${device.name}"`, 'info');
    setDeleteConfirmOpen(false);
  };

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

  const catColors = CATEGORY_COLORS[device.category] ?? CATEGORY_COLORS.other;

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

  function handlePress() { setPressing(true); }
  function handleRelease() { setPressing(false); }

  return (
    <article
      className={`device-card card-hover ${cardStateClass}${isOn ? ' glass-card' : ''}`}
      aria-label={`${device.name}: ${statusLabel}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        transform: pressing ? 'scale(0.95)' : 'scale(1)',
        transition: 'transform 150ms cubic-bezier(0.16,1,0.3,1), box-shadow var(--transition-base)',
      }}
      onPointerDown={handlePress}
      onPointerUp={handleRelease}
      onPointerLeave={handleRelease}
    >
      {/* Touch ripple layer */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          background: 'currentColor',
          opacity: pressing ? 0.06 : 0,
          transition: 'opacity 200ms',
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <div className="device-card-header">
        {/* 40×40 Icon pill with category color */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-lg)',
            background: isOn ? catColors.bg : 'var(--color-state-off-bg)',
            color: isOn ? catColors.color : 'var(--color-text-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background var(--transition-base), color var(--transition-base)',
          }}
        >
          <Icon size={22} aria-hidden="true" />
        </div>

        <div
          style={{
            flex: 1,
            minWidth: 0,
            cursor: 'pointer',
            userSelect: 'none',
            padding: '2px 4px',
            borderRadius: 6,
            background: isLongPressing ? 'rgba(239, 68, 68, 0.16)' : 'transparent',
            transition: 'background 0.2s ease',
          }}
          onPointerDown={handlePointerDownName}
          onPointerUp={handlePointerUpName}
          onPointerLeave={handlePointerUpName}
          onPointerCancel={handlePointerUpName}
          title="Press & hold on appliance name to delete"
        >
          <p className="device-name truncate" style={{ margin: 0 }}>{device.name}</p>
          {showRoom && room && (
            <p className="device-room" style={{ margin: 0 }}>{room.name}</p>
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

      {/* State badge — pill with color-coded bg */}
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

      {/* Error note */}
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

      {/* Options dropdown */}
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
          <button
            className="btn btn-ghost"
            style={{ width: '100%', justifyContent: 'flex-start', borderRadius: 0, padding: 'var(--space-3) var(--space-4)', gap: 8, fontSize: 13 }}
            onClick={(e) => {
              e.stopPropagation();
              setOptionsOpen(false);
              setEditOpen(true);
            }}
          >
            <Edit2 size={14} style={{ color: '#10b981' }} />
            Edit Device
          </button>
        </div>
      )}

      {/* Edit Device Modal */}
      {editOpen && (
        <DeviceModal
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          mode="edit"
          device={device}
        />
      )}

      {/* Delete Confirmation Modal — STRICT REQUIREMENT: Only appears when long-pressing the appliance name */}
      {deleteConfirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            animation: 'fadeIn 0.2s ease',
          }}
          onClick={(e) => {
            e.stopPropagation();
            setDeleteConfirmOpen(false);
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: 380,
              borderRadius: 22,
              padding: '24px',
              background: 'var(--color-surface)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Trash2 size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Delete Appliance
                </h3>
                <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 600 }}>
                  Long-press action
                </span>
              </div>
            </div>

            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 20 }}>
              Are you sure you want to delete <strong style={{ color: 'var(--color-text-primary)' }}>"{device.name}"</strong>? This appliance will be removed from your smart home panel and automations.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDeleteConfirmOpen(false)}
                style={{ borderRadius: 'var(--radius-full)', padding: '8px 18px', fontSize: 13 }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleDeleteDevice}
                style={{
                  borderRadius: 'var(--radius-full)',
                  padding: '8px 20px',
                  fontSize: 13,
                  background: '#ef4444',
                  borderColor: '#ef4444',
                  color: '#ffffff',
                  gap: 6,
                }}
              >
                <Trash2 size={14} />
                Delete Appliance
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
