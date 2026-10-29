// Residence User Profile Modal
import { User, ShieldCheck, Bluetooth, MapPin, KeyRound, Clock, X, HeartHandshake } from 'lucide-react';
import { useAppStore } from '../store/appStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileModal({ isOpen, onClose }: Props) {
  const devices = useAppStore((s) => s.devices);
  const rooms = useAppStore((s) => s.rooms);
  const bluetooth = useAppStore((s) => s.bluetooth);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ marginBottom: 'var(--space-4)' }}>
          <div className="flex items-center gap-3">
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-full)',
                background: 'linear-gradient(135deg, var(--color-blue-light) 0%, var(--color-accent-light) 100%)',
                color: 'var(--color-highlight)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--color-border)',
                fontFamily: 'var(--font-heading)',
                fontSize: '18px',
                fontWeight: 700
              }}
            >
              MR
            </div>
            <div>
              <h3 style={{ fontSize: 'var(--text-lg)', margin: 0 }}>Master Resident</h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', margin: 0 }}>
                Primary Household Administrator
              </p>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon sm" onClick={onClose} aria-label="Close Profile">
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Identity & Residence details */}
          <div
            style={{
              background: 'var(--color-bg-alt)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-4)',
              border: '1px solid var(--color-border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)'
            }}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                <MapPin size={14} style={{ color: 'var(--color-highlight)' }} /> Residence
              </span>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Estate Manor &middot; Primary Wing
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                <ShieldCheck size={14} style={{ color: 'var(--color-accent)' }} /> Access Authorization
              </span>
              <span className="badge" style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)', fontSize: '11px' }}>
                Full Autonomous Local Access
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                <Bluetooth size={14} style={{ color: 'var(--color-blue)' }} /> Controller Link
              </span>
              <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'monospace', color: 'var(--color-text-primary)' }}>
                {bluetooth.status === 'connected' ? (bluetooth.deviceName || 'ESP32 Linked') : 'Standby / Direct'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                <KeyRound size={14} style={{ color: 'var(--color-text-tertiary)' }} /> Channel Security
              </span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                Peer-to-Peer Bluetooth (Zero Cloud)
              </span>
            </div>
          </div>

          {/* Quick stats breakdown */}
          <div className="grid-2" style={{ gap: 'var(--space-3)' }}>
            <div
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3)',
                textAlign: 'center'
              }}
            >
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {rooms.length}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>Assigned Rooms</div>
            </div>

            <div
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3)',
                textAlign: 'center'
              }}
            >
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-highlight)' }}>
                {devices.length}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>Registered Nodes</div>
            </div>
          </div>

          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', lineHeight: 1.6, textAlign: 'center', margin: 0 }}>
            This profile governs local encryption keys and device mappings stored securely in your physical device storage.
          </p>
        </div>

        <div className="modal-footer" style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)' }}>
          <button className="btn btn-secondary w-full" onClick={onClose}>
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
}
