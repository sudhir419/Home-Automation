// ============================================================
// SMART MODES PAGE — Home / Away / Night / Sleep / Custom
// ============================================================
import { useState } from 'react';
import {
  Home, Car, Moon, Zap, Sliders, Check, Star,
  Lightbulb, Wind, Tv, Lock, ChevronRight, Info,
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { showToast } from '../components/ToastContainer';

interface SmartMode {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  color: string;
  actions: { label: string; detail: string }[];
}

const MODES: SmartMode[] = [
  {
    id: 'home',
    name: 'Home',
    icon: Home,
    description: 'Comfortable settings for when everyone is home.',
    color: '#3B82F6',
    actions: [
      { label: 'Lights', detail: 'Living room ON, bedrooms dimmed' },
      { label: 'Climate', detail: 'Fan ON in living room' },
      { label: 'Entertainment', detail: 'TV standby mode' },
    ],
  },
  {
    id: 'away',
    name: 'Away',
    icon: Car,
    description: 'Save energy when nobody is home.',
    color: '#f59e0b',
    actions: [
      { label: 'Lights', detail: 'All lights OFF' },
      { label: 'Climate', detail: 'All fans OFF' },
      { label: 'Devices', detail: 'Non-essential OFF' },
    ],
  },
  {
    id: 'night',
    name: 'Night',
    icon: Moon,
    description: 'Wind-down mode for evening hours.',
    color: '#8b5cf6',
    actions: [
      { label: 'Lights', detail: 'Dim bedroom lights 30%' },
      { label: 'Climate', detail: 'Bedroom fan ON low' },
      { label: 'Entertainment', detail: 'TV OFF' },
    ],
  },
  {
    id: 'sleep',
    name: 'Sleep',
    icon: Zap,
    description: 'Minimum activity for a good night\'s rest.',
    color: '#3b82f6',
    actions: [
      { label: 'Lights', detail: 'All lights OFF' },
      { label: 'Climate', detail: 'Fan ON silent' },
      { label: 'Devices', detail: 'All entertainment OFF' },
    ],
  },
  {
    id: 'custom',
    name: 'Custom',
    icon: Sliders,
    description: 'Your personalized mode — configure in Settings.',
    color: '#ec4899',
    actions: [
      { label: 'Lights', detail: 'User-defined' },
      { label: 'Climate', detail: 'User-defined' },
      { label: 'Other', detail: 'User-defined' },
    ],
  },
];

const MODE_ICONS: Record<string, React.ElementType> = {
  Lights: Lightbulb,
  Climate: Wind,
  Entertainment: Tv,
  Devices: Lock,
  Other: Sliders,
};

export default function SmartModesPage() {
  const preferences = useAppStore((s) => s.preferences);
  const setPreference = useAppStore((s) => s.setPreference);
  const devices = useAppStore((s) => s.devices);
  const setDeviceState = useAppStore((s) => s.setDeviceState);

  const [activating, setActivating] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const activeMode = ((preferences as unknown) as Record<string, unknown>).activeMode as string | undefined;

  function activateMode(modeId: string) {
    setActivating(modeId);

    // Simulate applying mode effects (batch device commands)
    setTimeout(() => {
      const mode = MODES.find((m) => m.id === modeId);
      if (!mode) return;

      if (modeId === 'away' || modeId === 'sleep') {
        // Turn everything OFF
        devices.forEach((d) => setDeviceState(d.id, 'off'));
        showToast(`${mode.name} Mode — All devices turned OFF`, 'info');
      } else if (modeId === 'home') {
        // Turn on lights category
        devices
          .filter((d) => d.category === 'lighting')
          .forEach((d) => setDeviceState(d.id, 'on'));
        showToast(`${mode.name} Mode activated`, 'success');
      } else if (modeId === 'night') {
        // Lights off, fans on
        devices
          .filter((d) => d.category === 'lighting')
          .forEach((d) => setDeviceState(d.id, 'off'));
        devices
          .filter((d) => d.category === 'climate')
          .forEach((d) => setDeviceState(d.id, 'on'));
        showToast(`${mode.name} Mode activated`, 'success');
      } else {
        showToast(`${mode.name} Mode activated`, 'success');
      }

      // Store active mode in preferences (using setPreference as generic KV)
      setPreference('defaultRoomId' as never, modeId as never);
      setActivating(null);
    }, 800);
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Smart Modes</h2>
          <p>Activate a preset to control multiple devices at once</p>
        </div>
      </div>

      {/* Active mode banner */}
      {activeMode && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 16px',
            borderRadius: 14,
            background: 'rgba(59,130,246,0.12)',
            border: '1px solid rgba(59,130,246,0.25)',
            marginBottom: 20,
          }}
        >
          <Star size={16} style={{ color: '#3B82F6' }} />
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', fontWeight: 500 }}>
            Active: <strong style={{ color: '#3B82F6' }}>
              {MODES.find((m) => m.id === activeMode)?.name ?? activeMode} Mode
            </strong>
          </span>
        </div>
      )}

      {/* Info note */}
      <div className="alert info mb-5" style={{ fontSize: 'var(--text-xs)' }}>
        <Info size={13} />
        Smart Modes send batch commands to your connected ESP32 via Bluetooth.
        Ensure Bluetooth is connected for real hardware effects.
      </div>

      {/* Mode cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {MODES.map((mode) => {
          const Icon = mode.icon;
          const isActive = activeMode === mode.id;
          const isExpanded = expanded === mode.id;
          const isActivating = activating === mode.id;

          return (
            <div
              key={mode.id}
              className="card"
              style={{
                padding: '12px 14px',
                border: isActive ? `1.5px solid ${mode.color}40` : undefined,
                background: isActive ? `${mode.color}08` : undefined,
                transition: 'all 200ms ease',
                overflow: 'hidden',
                boxSizing: 'border-box',
              }}
            >
              {/* Header row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  width: '100%',
                  minWidth: 0,
                  boxSizing: 'border-box',
                }}
                onClick={() => setExpanded(isExpanded ? null : mode.id)}
              >
                {/* Icon */}
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: `${mode.color}18`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={17} style={{ color: mode.color }} />
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2,
                  }}>
                    <span style={{
                      fontWeight: 600,
                      fontSize: 'var(--text-base)',
                      color: 'var(--color-text-primary)',
                      whiteSpace: 'nowrap',
                    }}>
                      {mode.name}
                    </span>
                    {isActive && (
                      <span style={{
                        fontSize: 9,
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: 12,
                        background: `${mode.color}20`,
                        color: mode.color,
                        letterSpacing: '0.03em',
                        textTransform: 'uppercase',
                        flexShrink: 0,
                      }}>
                        Active
                      </span>
                    )}
                  </div>
                  <p style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-secondary)',
                    margin: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {mode.description}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
                  <button
                    className={`btn btn-sm ${isActive ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={(e) => { e.stopPropagation(); activateMode(mode.id); }}
                    disabled={isActivating || isActive}
                    style={{
                      padding: '5px 10px',
                      borderRadius: 'var(--radius-full)',
                      background: isActive ? undefined : mode.color,
                      borderColor: isActive ? undefined : mode.color,
                      color: '#FFFFFF',
                      fontSize: 11,
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {isActivating ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span
                          style={{
                            width: 10, height: 10,
                            borderRadius: '50%',
                            border: '2px solid currentColor',
                            borderTopColor: 'transparent',
                            display: 'inline-block',
                            animation: 'spin 0.6s linear infinite',
                          }}
                        />
                        Loading
                      </span>
                    ) : isActive ? (
                      <><Check size={12} /> Active</>
                    ) : (
                      'Activate'
                    )}
                  </button>
                  <ChevronRight
                    size={16}
                    style={{
                      color: 'var(--color-text-tertiary)',
                      transform: isExpanded ? 'rotate(90deg)' : 'none',
                      transition: 'transform 200ms ease',
                      flexShrink: 0,
                    }}
                  />
                </div>
              </div>

              {/* Expanded actions */}
              {isExpanded && (
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', marginBottom: 10 }}>
                    What this mode does
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {mode.actions.map((action) => {
                      const ActionIcon = MODE_ICONS[action.label] ?? Sliders;
                      return (
                        <div key={action.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <ActionIcon size={15} style={{ color: mode.color, flexShrink: 0 }} />
                          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', flex: 1 }}>
                            <strong style={{ color: 'var(--color-text-primary)' }}>{action.label}:</strong> {action.detail}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
