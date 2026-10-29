// Bluetooth connection badge for top bar
import { Bluetooth } from 'lucide-react';
import { useAppStore } from '../store/appStore';

interface Props {
  compact?: boolean;
}

export default function BluetoothBadge({ compact }: Props) {
  const status = useAppStore((s) => s.bluetooth.status);
  const deviceName = useAppStore((s) => s.bluetooth.deviceName);
  const isDemo = useAppStore((s) => s.bluetooth.isDemo);

  const label =
    status === 'connected'
      ? compact ? 'BT' : (deviceName ?? 'Connected')
      : status === 'connecting'
      ? 'Connecting…'
      : status === 'scanning'
      ? 'Scanning…'
      : status === 'error'
      ? 'BT Error'
      : 'Disconnected';

  const dotClass =
    status === 'connected' ? 'connected' :
    status === 'connecting' || status === 'scanning' ? 'connecting' :
    status === 'error' ? 'error' : 'disconnected';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        padding: '4px 10px',
        borderRadius: 'var(--radius-full)',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border-subtle)',
        fontSize: 'var(--text-xs)',
        fontWeight: 600,
        color: 'var(--color-text-secondary)',
        cursor: 'default',
        userSelect: 'none',
      }}
      title={isDemo ? `Demo mode · ${label}` : label}
      aria-label={`Bluetooth: ${label}`}
      role="status"
    >
      <span className={`status-dot ${dotClass}`} aria-hidden="true" />
      {!compact && <Bluetooth size={12} aria-hidden="true" />}
      {!compact && <span>{isDemo ? `[DEMO] ${label}` : label}</span>}
    </div>
  );
}
