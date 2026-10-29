// ============================================================
// SETTINGS PAGE
// ============================================================
import { useState } from 'react';
import {
  Sun, Moon, Monitor, Thermometer, Bluetooth, Info,
  RotateCcw, Shield, BookOpen, AlertTriangle, Check,
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { useTheme } from '../hooks/useTheme';
import { showToast } from '../components/ToastContainer';

const APP_VERSION = '1.0.0-alpha';
const BUILD_DATE = '2026-10-26';

export default function SettingsPage() {
  const preferences = useAppStore((s) => s.preferences);
  const setPreference = useAppStore((s) => s.setPreference);
  const resetDemoData = useAppStore((s) => s.resetDemoData);
  const { setTheme } = useTheme();
  const [confirmReset, setConfirmReset] = useState(false);

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

      {/* Theme */}
      <div className="card mb-5">
        <h4 style={{ marginBottom: 'var(--space-4)' }}>Appearance</h4>

        <div className="setting-row">
          <div className="setting-row-info">
            <h5>Theme</h5>
            <p>Choose light, dark, or follow system preference</p>
          </div>
          <div className="flex gap-2">
            {[
              { value: 'light', icon: Sun, label: 'Light' },
              { value: 'dark', icon: Moon, label: 'Dark' },
              { value: 'system', icon: Monitor, label: 'System' },
            ].map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                className={`btn btn-sm ${preferences.theme === value ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleThemeChange(value as 'light' | 'dark' | 'system')}
                aria-pressed={preferences.theme === value}
                title={label}
              >
                <Icon size={14} />
                <span className="hidden-mobile">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Demo mode */}
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

      {/* Device preferences */}
      <div className="card mb-5">
        <h4 style={{ marginBottom: 'var(--space-4)' }}>Device Preferences</h4>

        <div className="setting-row">
          <div className="setting-row-info">
            <h5>Temperature Unit</h5>
            <p>Unit for temperature display when a sensor is connected</p>
          </div>
          <div className="flex gap-2">
            {(['C', 'F'] as const).map((unit) => (
              <button
                key={unit}
                className={`btn btn-sm ${preferences.tempUnit === unit ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setPreference('tempUnit', unit)}
                aria-pressed={preferences.tempUnit === unit}
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

      {/* Reset */}
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

      {/* Safety */}
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

      {/* About */}
      <div className="card">
        <h4 style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <BookOpen size={18} /> About
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
          <div className="flex items-center justify-between">
            <span>App Name</span>
            <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>Home Automation</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Subtitle</span>
            <span style={{ color: 'var(--color-text-primary)' }}>Bluetooth Smart Living System</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Version</span>
            <span style={{ color: 'var(--color-text-primary)', fontFamily: 'monospace' }}>{APP_VERSION}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Build Date</span>
            <span style={{ color: 'var(--color-text-primary)', fontFamily: 'monospace' }}>{BUILD_DATE}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Stack</span>
            <span style={{ color: 'var(--color-text-primary)' }}>React · TypeScript · Vite · Zustand</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Target Platform</span>
            <span style={{ color: 'var(--color-text-primary)' }}>Android (via Capacitor)</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Controller</span>
            <span style={{ color: 'var(--color-text-primary)' }}>ESP32 (model TBC)</span>
          </div>
        </div>

        <hr className="divider" />

        <div className="alert info" style={{ fontSize: 'var(--text-xs)' }}>
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
