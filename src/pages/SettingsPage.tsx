// ============================================================
// SETTINGS PAGE — Compact Grouped / Accordion Design
// ============================================================
import { useState, useEffect } from 'react';
import {
  Sun, Moon, Monitor, Bluetooth, Info,
  RotateCcw, Shield, BookOpen, AlertTriangle, ExternalLink,
  ChevronDown, Palette, Cpu, Sliders, Database, HelpCircle
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

interface SectionProps {
  id: string;
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function AccordionSection({ title, icon: Icon, children, defaultOpen = false }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 14,
        marginBottom: 10,
        overflow: 'hidden',
        transition: 'border-color 200ms ease, box-shadow 200ms ease',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 14px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-text-primary)',
          textAlign: 'left',
        }}
        aria-expanded={open}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(16,185,129,0.12)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon size={16} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{title}</span>
        </div>
        <ChevronDown
          size={16}
          style={{
            color: 'var(--color-text-tertiary)',
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 200ms ease',
          }}
        />
      </button>

      {open && (
        <div
          style={{
            padding: '4px 14px 14px',
            borderTop: '1px solid var(--color-border-subtle)',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const preferences = useAppStore((s) => s.preferences);
  const setPreference = useAppStore((s) => s.setPreference);
  const resetDemoData = useAppStore((s) => s.resetDemoData);
  const { setTheme } = useTheme();
  const [confirmReset, setConfirmReset] = useState(false);

  // BLE UUID config state
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
      <div className="page-header" style={{ marginBottom: 14 }}>
        <h2>Settings</h2>
        <p>Preferences, hardware and configuration</p>
      </div>

      {/* ── 1. Appearance Section (Expanded by default) ── */}
      <AccordionSection id="appearance" title="Appearance & Display" icon={Palette} defaultOpen={true}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>Theme Mode</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>Light, dark, or system match</div>
            </div>
            <div
              style={{
                display: 'flex',
                gap: 2,
                background: 'var(--color-bg-alt)',
                borderRadius: 'var(--radius-full)',
                padding: 3,
                border: '1px solid var(--color-border)',
              }}
            >
              {([
                { value: 'light', icon: Sun, label: 'Light' },
                { value: 'system', icon: Monitor, label: 'Auto' },
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
                    gap: 4,
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: preferences.theme === value ? 600 : 400,
                    background: preferences.theme === value ? 'var(--color-surface)' : 'transparent',
                    color: preferences.theme === value ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                    boxShadow: preferences.theme === value ? 'var(--shadow-sm)' : 'none',
                    transition: 'all var(--transition-fast)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Icon size={12} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingTop: 8, borderTop: '1px solid var(--color-border-subtle)' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>Temperature Unit</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>Unit for ambient sensor stats</div>
            </div>
            <div style={{ display: 'flex', gap: 2, background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-full)', padding: 3, border: '1px solid var(--color-border)' }}>
              {(['C', 'F'] as const).map((unit) => (
                <button
                  key={unit}
                  aria-pressed={preferences.tempUnit === unit}
                  onClick={() => setPreference('tempUnit', unit)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: preferences.tempUnit === unit ? 600 : 400,
                    background: preferences.tempUnit === unit ? 'var(--color-surface)' : 'transparent',
                    color: preferences.tempUnit === unit ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                    boxShadow: preferences.tempUnit === unit ? 'var(--shadow-sm)' : 'none',
                    fontSize: 12,
                  }}
                >
                  °{unit}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingTop: 8, borderTop: '1px solid var(--color-border-subtle)' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>Intro Welcome Screen</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>Show 3D preview on next app start</div>
            </div>
            <label className="toggle-switch" aria-label="Show intro screen">
              <input
                type="checkbox"
                checked={preferences.showIntro}
                onChange={(e) => setPreference('showIntro', e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>
      </AccordionSection>

      {/* ── 2. Hardware & Bluetooth Config ── */}
      <AccordionSection id="hardware" title="Hardware & Bluetooth" icon={Bluetooth} defaultOpen={false}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>Demo Mode</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>Simulate devices without hardware</div>
            </div>
            <label className="toggle-switch" aria-label="Toggle demo mode">
              <input
                type="checkbox"
                checked={preferences.demoMode}
                onChange={(e) => {
                  setPreference('demoMode', e.target.checked);
                  showToast(e.target.checked ? 'Demo mode enabled' : 'Real hardware mode active', 'info');
                }}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          {!preferences.demoMode && (
            <div style={{ fontSize: 11, padding: '8px 10px', background: 'rgba(245,158,11,0.1)', color: '#d97706', borderRadius: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
              <AlertTriangle size={14} style={{ flexShrink: 0 }} />
              Commands will transmit over Bluetooth to connected ESP32 pins.
            </div>
          )}

          <div style={{ paddingTop: 6, borderTop: '1px solid var(--color-border-subtle)' }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
              ESP32 Service UUID
            </label>
            <input
              className="form-input"
              type="text"
              placeholder={DEFAULT_BLE.serviceUUID}
              value={bleConfig.serviceUUID}
              onChange={(e) => setBleConfig((c: typeof DEFAULT_BLE) => ({ ...c, serviceUUID: e.target.value.trim() }))}
              spellCheck={false}
              style={{ fontFamily: 'monospace', fontSize: 11, padding: '6px 10px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
              TX Characteristic UUID
            </label>
            <input
              className="form-input"
              type="text"
              placeholder={DEFAULT_BLE.txCharUUID}
              value={bleConfig.txCharUUID}
              onChange={(e) => setBleConfig((c: typeof DEFAULT_BLE) => ({ ...c, txCharUUID: e.target.value.trim() }))}
              spellCheck={false}
              style={{ fontFamily: 'monospace', fontSize: 11, padding: '6px 10px' }}
            />
          </div>

          <button
            className="btn btn-secondary btn-sm"
            style={{ alignSelf: 'flex-start', fontSize: 11, padding: '4px 10px' }}
            onClick={() => {
              setBleConfig({ ...DEFAULT_BLE });
              showToast('BLE UUIDs reset to defaults', 'success');
            }}
          >
            Reset UUIDs to Defaults
          </button>
        </div>
      </AccordionSection>

      {/* ── 3. Data Management ── */}
      <AccordionSection id="data" title="Data Management" icon={Database} defaultOpen={false}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingTop: 10 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>Reset Demo Data</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>Restore devices, rooms, schedules to factory presets</div>
          </div>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => setConfirmReset(true)}
            style={{ fontSize: 12, padding: '6px 12px', flexShrink: 0 }}
          >
            <RotateCcw size={13} /> Reset
          </button>
        </div>
      </AccordionSection>

      {/* ── 4. Safety Information ── */}
      <AccordionSection id="safety" title="Safety Information" icon={Shield} defaultOpen={false}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 10 }}>
          <div style={{ padding: '8px 10px', background: 'rgba(239,68,68,0.1)', color: '#dc2626', borderRadius: 8, fontSize: 11, lineHeight: 1.4, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
            <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            <span><strong>Never connect 230V mains directly to ESP32 GPIO pins.</strong> Requires relay isolation and circuit protection.</span>
          </div>
          <ul style={{ paddingLeft: 18, color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.6, margin: 0 }}>
            <li>Hardware: 2× low-voltage LEDs with resistors confirmed.</li>
            <li>Geyser and fan controls operate in Demo mode until verified.</li>
            <li>Always ensure safe enclosure for prototyping.</li>
          </ul>
        </div>
      </AccordionSection>

      {/* ── 5. About App ── */}
      <AccordionSection id="about" title="About Application" icon={BookOpen} defaultOpen={false}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 10, fontSize: 12 }}>
          {[
            ['App Name', 'Home Auto'],
            ['Version', APP_VERSION],
            ['Build Date', BUILD_DATE],
            ['Platform', 'Android PWA · Web Bluetooth'],
            ['Controller', 'ESP32 (BLE GATT)'],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--color-text-tertiary)' }}>{label}</span>
              <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{value}</span>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 8, marginTop: 6, paddingTop: 8, borderTop: '1px solid var(--color-border-subtle)' }}>
            <a
              href="https://github.com/sudhir419/Home-Automation"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm"
              style={{ fontSize: 11 }}
            >
              <ExternalLink size={12} /> GitHub Repo
            </a>
            <a
              href="https://docs.espressif.com/projects/esp-idf/en/stable/esp32/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm"
              style={{ fontSize: 11 }}
            >
              <ExternalLink size={12} /> ESP32 Docs
            </a>
          </div>
        </div>
      </AccordionSection>

      {/* Reset confirm modal */}
      {confirmReset && (
        <div className="modal-overlay" onClick={() => setConfirmReset(false)}>
          <div className="modal" style={{ maxWidth: 360 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 16 }}>Reset Demo Data?</h3>
            <p style={{ marginTop: 8, fontSize: 13, color: 'var(--color-text-secondary)' }}>
              All devices, rooms, and schedules will be restored to defaults. Theme preference is preserved.
            </p>
            <div className="modal-footer" style={{ marginTop: 14 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setConfirmReset(false)}>
                Cancel
              </button>
              <button className="btn btn-danger btn-sm" onClick={handleReset}>
                <RotateCcw size={13} /> Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
