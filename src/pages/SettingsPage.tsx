// ============================================================
// SETTINGS PAGE — Premium with BLE UUID Config & Theme Pills
// ============================================================
import { useState, useEffect } from 'react';
import {
  Sun, Moon, Monitor, Bluetooth, Info,
  RotateCcw, Shield, BookOpen, AlertTriangle, ExternalLink,
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { useTheme } from '../hooks/useTheme';
import { showToast } from '../components/ToastContainer';

const APP_VERSION = '1.0.0-alpha';
const BUILD_DATE = '2026-10-26';

const DEFAULT_BLE = {
  serviceUUID: '4fafc201-1fb5-459e-8fcc-c5c9c331914b',
  txCharUUID: 'beb5483e-36e1-4688-b7f5-ea07361b26a8',
};

function loadBleConfig() {
  try {
    const raw = localStorage.getItem('bleConfig');
    return raw ? { ...DEFAULT_BLE, ...JSON.parse(raw) } : { ...DEFAULT_BLE };
  } catch {
    return { ...DEFAULT_BLE };
  }
}

function saveBleConfig(cfg: typeof DEFAULT_BLE) {
  localStorage.setItem('bleConfig', JSON.stringify(cfg));
}

export default function SettingsPage() {
  const preferences = useAppStore((s) => s.preferences);
  const setPreference = useAppStore((s) => s.setPreference);
  const resetDemoData = useAppStore((s) => s.resetDemoData);
  const { setTheme } = useTheme();
  const [confirmReset, setConfirmReset] = useState(false);

  // BLE UUID config state (localStorage only, no store change)
  const [bleConfig, setBleConfig] = useState(loadBleConfig);

  useEffect(() => {
    saveBleConfig(bleConfig);
  }, [bleConfig]);

  function handleThemeChange(t: 'light' | 'dark' | 'system') {
    setTheme(t);
    showToast(`Theme set to ${t}`, 'success');
  }

  function handleReset() {
    resetDemoData();
    setConfirmReset(false);
    showToast('Demo data reset to defaults', 'success');
  }

  return (
    <div>
      <div className="page-header">
        <h2>Settings</h2>
        <p>Preferences, information and app configuration</p>
      </div>

      {/* ── Theme — Pill Picker ── */}
      <div className="card mb-5">
        <h4 style={{ marginBottom: 'var(--space-4)' }}>Appearance</h4>

        <div className="setting-row">
          <div className="setting-row-info">
            <h5>Theme</h5>
            <p>Choose light, dark, or follow system preference</p>
          </div>
          {/* 3 pills instead of a dropdown */}
          <div
            style={{
              display: 'flex',
              gap: 4,
              background: 'var(--color-bg-alt)',
              borderRadius: 'var(--radius-full)',
              padding: 4,
              border: '1px solid var(--color-border)',
            }}
          >
            {([
              { value: 'light', icon: Sun, label: 'Light' },
              { value: 'system', icon: Monitor, label: 'System' },
              { value: 'dark', icon: Moon, label: 'Dark' },
            ] as const).map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => handleThemeChange(value)}
                aria-pressed={preferences.theme === value}
                title={label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 'var(--text-sm)',
                  fontWeight: preferences.theme === value ? 600 : 400,
                  background: preferences.theme === value ? 'var(--color-surface)' : 'transparent',
                  color: preferences.theme === value ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                  boxShadow: preferences.theme === value ? 'var(--shadow-sm)' : 'none',
                  transition: 'all var(--transition-fast)',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={14} />
                <span className="hidden-mobile">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── ESP32 BLE UUID Configuration ── */}
      <div className="card mb-5">
        <h4 style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Bluetooth size={18} /> ESP32 BLE Configuration
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label
              htmlFor="ble-service-uuid"
              style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)' }}
            >
              Service UUID
            </label>
            <input
              id="ble-service-uuid"
              className="form-input"
              type="text"
              placeholder={DEFAULT_BLE.serviceUUID}
              value={bleConfig.serviceUUID}
              onChange={(e) => setBleConfig((c: typeof DEFAULT_BLE) => ({ ...c, serviceUUID: e.target.value.trim() }))}
              spellCheck={false}
              style={{ fontFamily: 'monospace', fontSize: 'var(--text-sm)' }}
            />
          </div>

          <div>
            <label
              htmlFor="ble-tx-uuid"
              style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)' }}
            >
              TX Characteristic UUID
            </label>
            <input
              id="ble-tx-uuid"
              className="form-input"
              type="text"
              placeholder={DEFAULT_BLE.txCharUUID}
              value={bleConfig.txCharUUID}
              onChange={(e) => setBleConfig((c: typeof DEFAULT_BLE) => ({ ...c, txCharUUID: e.target.value.trim() }))}
              spellCheck={false}
              style={{ fontFamily: 'monospace', fontSize: 'var(--text-sm)' }}
            />
          </div>

          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', margin: 0 }}>
            Configure the BLE service/characteristic UUIDs matching your ESP32 firmware. Changes are saved automatically.
          </p>

          <button
            className="btn btn-secondary btn-sm"
            style={{ alignSelf: 'flex-start' }}
            onClick={() => {
              setBleConfig({ ...DEFAULT_BLE });
              showToast('BLE UUIDs reset to defaults', 'success');
            }}
          >
            Reset to defaults
          </button>
        </div>
      </div>

      {/* ── Demo mode ── */}
      <div className="card mb-5">
        <h4 style={{ marginBottom: 'var(--space-4)' }}>Operation Mode</h4>

        <div className="setting-row">
          <div className="setting-row-info">
            <h5>Demo Mode</h5>
            <p>
              Simulate device control without real hardware.
              All state changes are visual only — no Bluetooth commands are sent.
            </p>
          </div>
          <label className="toggle-switch" aria-label="Toggle demo mode">
            <input
              type="checkbox"
              checked={preferences.demoMode}
              onChange={(e) => {
                setPreference('demoMode', e.target.checked);
                showToast(
                  e.target.checked ? 'Demo mode enabled' : 'Demo mode disabled — real hardware mode active',
                  'info'
                );
              }}
            />
            <span className="toggle-slider" />
          </label>
        </div>

        {!preferences.demoMode && (
          <div className="alert warning mt-4">
            <AlertTriangle size={16} />
            <span>
              <strong>Real hardware mode.</strong> Toggles will send Bluetooth commands to the ESP32.
              Ensure the device is connected and only confirmed outputs (Light 1, Light 2) are used.
            </span>
          </div>
        )}
      </div>

      {/* ── Device preferences ── */}
      <div className="card mb-5">
        <h4 style={{ marginBottom: 'var(--space-4)' }}>Device Preferences</h4>

        <div className="setting-row">
          <div className="setting-row-info">
            <h5>Temperature Unit</h5>
            <p>Unit for temperature display when a sensor is connected</p>
          </div>
          <div style={{ display: 'flex', gap: 4, background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-full)', padding: 4, border: '1px solid var(--color-border)' }}>
            {(['C', 'F'] as const).map((unit) => (
              <button
                key={unit}
                aria-pressed={preferences.tempUnit === unit}
                onClick={() => setPreference('tempUnit', unit)}
                style={{
                  padding: '6px 16px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: preferences.tempUnit === unit ? 600 : 400,
                  background: preferences.tempUnit === unit ? 'var(--color-surface)' : 'transparent',
                  color: preferences.tempUnit === unit ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                  boxShadow: preferences.tempUnit === unit ? 'var(--shadow-sm)' : 'none',
                  transition: 'all var(--transition-fast)',
                  fontSize: 'var(--text-sm)',
                }}
              >
                °{unit}
              </button>
            ))}
          </div>
        </div>

        <div className="setting-row">
          <div className="setting-row-info">
            <h5>Introductory Screen</h5>
            <p>Show the animated welcome screen on next launch</p>
          </div>
          <label className="toggle-switch" aria-label="Show intro screen on next launch">
            <input
              type="checkbox"
              checked={preferences.showIntro}
              onChange={(e) => setPreference('showIntro', e.target.checked)}
            />
            <span className="toggle-slider" />
          </label>
        </div>
      </div>

      {/* ── Reset ── */}
      <div className="card mb-5">
        <h4 style={{ marginBottom: 'var(--space-4)' }}>Data Management</h4>

        <div className="setting-row">
          <div className="setting-row-info">
            <h5>Reset Demo Data</h5>
            <p>
              Restore all devices, rooms, and schedules to their default demo state.
              Your theme preference will not change.
            </p>
          </div>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => setConfirmReset(true)}
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>

      {/* ── Safety ── */}
      <div className="card mb-5">
        <h4 style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Shield size={18} /> Safety Information
        </h4>
        <div className="alert error" style={{ marginBottom: 'var(--space-4)' }}>
          <AlertTriangle size={16} />
          <div style={{ fontSize: 'var(--text-sm)' }}>
            <strong>Never connect 230V mains-powered appliances directly to ESP32 GPIO pins.</strong>
            Any real high-voltage switching requires appropriately rated, enclosed relay hardware,
            proper electrical protection, and supervision by a qualified teacher.
          </div>
        </div>
        <ul style={{ paddingLeft: 'var(--space-5)', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 2 }}>
          <li>Initial hardware: 2× low-voltage LEDs with current-limiting resistors only.</li>
          <li>Geyser and fan controls are marked <strong>Demo Only</strong> until proper hardware is installed.</li>
          <li>This app does not confirm physical device state unless the firmware sends acknowledgements.</li>
          <li>Do not assume an appliance is OFF just because the UI shows it as OFF.</li>
        </ul>
      </div>

      {/* ── About ── */}
      <div className="card">
        <h4 style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <BookOpen size={18} /> About
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
          {[
            ['App Name', 'Home Automation'],
            ['Version', APP_VERSION],
            ['Build Date', BUILD_DATE],
            ['Stack', 'React · TypeScript · Vite · Zustand'],
            ['Target Platform', 'Android (via Capacitor)'],
            ['Controller', 'ESP32 (model TBC)'],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between">
              <span>{label}</span>
              <span style={{ color: 'var(--color-text-primary)', fontWeight: label === 'Version' || label === 'Build Date' ? 400 : 600, fontFamily: label === 'Version' || label === 'Build Date' ? 'monospace' : undefined }}>
                {value}
              </span>
            </div>
          ))}
        </div>

        <hr className="divider" />

        {/* Links */}
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-sm"
          >
            <ExternalLink size={13} /> GitHub
          </a>
          <a
            href="https://docs.espressif.com/projects/esp-idf/en/stable/esp32/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-sm"
          >
            <ExternalLink size={13} /> ESP32 Docs
          </a>
        </div>

        <div className="alert info" style={{ fontSize: 'var(--text-xs)', marginTop: 'var(--space-4)' }}>
          <Info size={14} />
          This is a student capstone project. All hardware integration is prototype-grade.
          Not for use with safety-critical appliances without proper engineering review.
        </div>
      </div>

      {/* Reset confirm modal */}
      {confirmReset && (
        <div className="modal-overlay" onClick={() => setConfirmReset(false)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={(e) => e.stopPropagation()}>
            <h3>Reset Demo Data?</h3>
            <p style={{ marginTop: 'var(--space-3)' }}>
              All devices, rooms, and schedules will be restored to their default state.
              Activity log will be cleared. Your theme preference is preserved.
            </p>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setConfirmReset(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleReset}>
                <RotateCcw size={14} /> Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
