// ============================================================
// BLUETOOTH PAGE — Premium UI with Web BT support
// ============================================================
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bluetooth, BluetoothOff, RefreshCw, Unlink,
  AlertCircle, Info, Shield, Smartphone, CheckCircle,
  Signal, WifiOff,
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { useBluetooth } from '../services/bluetooth/useBluetooth';
import { bluetoothAdapter, getBLEConfig } from '../services/bluetooth/bluetoothService';

type FoundDevice = { name: string; address: string };

// ---- Browser capability checks (evaluated once at module load) ------------------
const isWebBTSupported = 'bluetooth' in navigator;
const isHTTPS =
  typeof location !== 'undefined' &&
  (location.protocol === 'https:' || location.hostname === 'localhost');

// ---- Signal quality pill -------------------------------------------------------
function SignalBars({ strength = 3 }: { strength?: number }) {
  const bars = [1, 2, 3, 4];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 16 }}>
      {bars.map((b) => (
        <div
          key={b}
          style={{
            width: 4,
            height: 4 + b * 3,
            borderRadius: 2,
            background: b <= strength ? 'var(--color-accent)' : 'var(--color-border)',
            transition: 'background 0.3s',
          }}
        />
      ))}
    </div>
  );
}

// ============================================================
export default function BluetoothPage() {
  const bluetooth = useAppStore((s) => s.bluetooth);
  const { connect, disconnect } = useBluetooth();
  const [foundDevices, setFoundDevices] = useState<FoundDevice[]>([]);
  const [scanning, setScanning] = useState(false);
  const addActivity = useAppStore((s) => s.addActivity);
  const setBluetooth = useAppStore((s) => s.setBluetooth);
  const bleConfig = getBLEConfig();

  const isConnected = bluetooth.status === 'connected';
  const isConnecting = bluetooth.status === 'connecting';
  const isError = bluetooth.status === 'error';

  // ---- Header state label -------------------------------------------------------
  const statusLabel = isConnected
    ? `Connected to ${bluetooth.deviceName ?? 'ESP32'}`
    : isConnecting
    ? 'Connecting…'
    : scanning
    ? 'Scanning…'
    : isError
    ? 'Error'
    : 'Ready to Connect';

  // ---- Scan handler -------------------------------------------------------------
  async function handleScan() {
    setFoundDevices([]);
    setScanning(true);
    setBluetooth({ status: 'scanning', errorMessage: null });
    addActivity({
      category: 'bluetooth',
      level: 'info',
      title: 'Scanning for devices…',
      detail: null,
      isHardwareConfirmed: false,
    });
    try {
      await bluetoothAdapter.startScan((name, address) => {
        setFoundDevices((prev) => {
          const exists = prev.some((d) => d.address === address);
          return exists ? prev : [...prev, { name, address }];
        });
        setBluetooth({ status: 'ready', deviceName: name, deviceAddress: address });
        addActivity({
          category: 'bluetooth',
          level: 'success',
          title: `Found: ${name}`,
          detail: address,
          isHardwareConfirmed: false,
        });
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setBluetooth({ status: 'error', errorMessage: msg });
    } finally {
      setScanning(false);
    }
  }

  async function handleDisconnect() {
    await disconnect();
    setFoundDevices([]);
  }

  // ---- Render -------------------------------------------------------------------
  return (
    <div>
      <div className="page-header">
        <h2>Bluetooth</h2>
        <p>Manage BLE device connection and pairing</p>
      </div>

      {/* ── Browser support warnings ─────────────────────────── */}
      {!isWebBTSupported && (
        <div className="alert warning" style={{ marginBottom: 'var(--space-4)' }}>
          <WifiOff size={16} aria-hidden="true" />
          <span>
            Web Bluetooth is not available in this browser.
            Use <strong>Chrome on Android</strong> or <strong>Chrome on Desktop</strong>.
          </span>
        </div>
      )}
      {isWebBTSupported && !isHTTPS && (
        <div className="alert warning" style={{ marginBottom: 'var(--space-4)' }}>
          <AlertCircle size={16} aria-hidden="true" />
          <span>
            Web Bluetooth requires HTTPS. Please open the <strong>Vercel URL</strong> instead of an HTTP URL.
          </span>
        </div>
      )}

      {/* ── Status header card ───────────────────────────────── */}
      <div
        className="glass-card mb-6"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: 'var(--space-8) var(--space-6)',
          gap: 'var(--space-4)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Radar animation or static icon */}
        <div
          className="bt-radar"
          style={{ position: 'relative', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {scanning && (
            <>
              <div className="bt-radar-ring ring-1" />
              <div className="bt-radar-ring ring-2" />
              <div className="bt-radar-ring ring-3" />
            </>
          )}
          <div
            className="bt-icon-center"
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: isConnected
                ? 'var(--color-accent)'
                : isError
                ? 'var(--color-error, #ef4444)'
                : scanning
                ? 'var(--color-accent)'
                : 'var(--color-surface-raised, #161616)',
              border: '2px solid var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isConnected || scanning ? '#fff' : 'var(--color-accent)',
              transition: 'background 0.4s, color 0.4s',
              zIndex: 1,
              position: 'relative',
            }}
          >
            {isError
              ? <BluetoothOff size={32} aria-hidden="true" />
              : <Bluetooth size={32} aria-hidden="true" />}
          </div>
        </div>

        {/* Status label */}
        <div>
          <h3 style={{ margin: 0, marginBottom: 'var(--space-1)' }}>{statusLabel}</h3>
          {isConnected && bluetooth.deviceAddress && (
            <div
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-tertiary)',
                fontFamily: 'monospace',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-2)',
              }}
            >
              {bluetooth.deviceAddress}
              <SignalBars strength={3} />
            </div>
          )}
          {isError && bluetooth.errorMessage && (
            <div
              className="alert error"
              style={{ marginTop: 'var(--space-3)', textAlign: 'left' }}
            >
              <AlertCircle size={14} aria-hidden="true" />
              {bluetooth.errorMessage}
            </div>
          )}
        </div>

        {/* Action button */}
        {isConnected ? (
          <button className="btn btn-secondary btn-lg" onClick={handleDisconnect}>
            <Unlink size={18} aria-hidden="true" /> Disconnect
          </button>
        ) : (
          <button
            className="btn btn-primary btn-lg"
            onClick={handleScan}
            disabled={scanning || isConnecting || !isWebBTSupported}
            aria-label={scanning ? 'Scanning for devices' : 'Scan for Bluetooth devices'}
          >
            <RefreshCw
              size={18}
              aria-hidden="true"
              style={scanning ? { animation: 'spin 1s linear infinite' } : {}}
            />
            {scanning ? 'Scanning…' : isConnecting ? 'Connecting…' : 'Scan for Devices'}
          </button>
        )}

        {bluetooth.lastConnectedAt && !isConnected && (
          <p
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-disabled)',
              margin: 0,
            }}
          >
            Last connected: {new Date(bluetooth.lastConnectedAt).toLocaleString()}
          </p>
        )}
      </div>

      {/* ── Connected state card ─────────────────────────────── */}
      {isConnected && (
        <div
          className="bt-connected-info glass-card mb-6"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: 'var(--space-4)',
          }}
        >
          <CheckCircle size={22} style={{ color: 'var(--color-accent)', flexShrink: 0 }} aria-hidden="true" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="font-semibold" style={{ fontWeight: 600 }}>
              {bluetooth.deviceName}
            </div>
            <div
              className="text-xs text-tertiary"
              style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}
            >
              BLE Connected · ESP32
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleDisconnect}>
            Disconnect
          </button>
        </div>
      )}

      {/* ── Found devices list ───────────────────────────────── */}
      {foundDevices.length > 0 && !isConnected && (
        <div className="card mb-6">
          <h4 style={{ marginBottom: 'var(--space-4)' }}>Found Devices</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {foundDevices.map((device) => (
              <div key={device.address} className="found-device-card glass-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-3) var(--space-4)',
                }}
              >
                <div
                  className="device-icon-pill"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'var(--color-accent-light, rgba(16,185,129,0.12))',
                    color: 'var(--color-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Bluetooth size={18} aria-hidden="true" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    className="device-name"
                    style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}
                  >
                    {device.name}
                  </div>
                  <div
                    className="device-id text-xs text-tertiary"
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-tertiary)',
                      fontFamily: 'monospace',
                    }}
                  >
                    {device.address}
                  </div>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => connect(device.address, device.name)}
                  disabled={isConnecting}
                  aria-label={`Connect to ${device.name}`}
                >
                  Connect
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── BLE UUID configuration ───────────────────────────── */}
      <div className="card mb-6">
        <h4 style={{ marginBottom: 'var(--space-3)' }}>BLE Service Configuration</h4>
        <div
          className="text-sm text-secondary"
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            lineHeight: 2,
          }}
        >
          <div>
            Service:{' '}
            <code
              style={{
                fontFamily: 'monospace',
                background: 'var(--color-bg-alt)',
                padding: '1px 6px',
                borderRadius: 4,
                fontSize: 'var(--text-xs)',
              }}
            >
              {bleConfig.serviceUUID}
            </code>
          </div>
          <div>
            TX Char:{' '}
            <code
              style={{
                fontFamily: 'monospace',
                background: 'var(--color-bg-alt)',
                padding: '1px 6px',
                borderRadius: 4,
                fontSize: 'var(--text-xs)',
              }}
            >
              {bleConfig.txCharUUID}
            </code>
          </div>
        </div>
        <Link
          to="/settings"
          style={{
            display: 'inline-block',
            marginTop: 'var(--space-2)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-accent)',
            textDecoration: 'none',
          }}
        >
          Configure in Settings →
        </Link>
      </div>

      {/* ── Architecture info ────────────────────────────────── */}
      <div className="card mb-6">
        <h4 style={{ marginBottom: 'var(--space-4)' }}>Bluetooth Architecture</h4>
        <div className="alert info" style={{ marginBottom: 'var(--space-4)' }}>
          <Info size={16} aria-hidden="true" />
          <div>
            {isWebBTSupported ? (
              <>
                <strong>Web Bluetooth Active</strong> — Using the browser's native BLE API
                (Chrome/Chromium). Scan will open the browser device picker.
              </>
            ) : (
              <>
                <strong>Demo Mode Active</strong> — The MockBluetoothAdapter simulates scanning
                and connection. No real hardware is used in this browser mode.
              </>
            )}
          </div>
        </div>
        <div
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            lineHeight: 2,
          }}
        >
          <div>
            <strong>Current adapter:</strong>{' '}
            {isWebBTSupported ? 'WebBluetoothAdapter (real BLE)' : 'MockBluetoothAdapter (demo)'}
          </div>
          <div><strong>Target hardware:</strong> ESP32 development board (model TBC)</div>
          <div><strong>Protocol:</strong> BLE GATT over {bleConfig.serviceUUID.slice(0, 8)}…</div>
          <div>
            <strong>Command format:</strong>{' '}
            <code
              style={{
                fontFamily: 'monospace',
                background: 'var(--color-bg-alt)',
                padding: '1px 6px',
                borderRadius: 4,
              }}
            >
              L1_ON\n
            </code>{' '}
            (newline-terminated ASCII)
          </div>
          <div>
            <strong>APK plugin:</strong> Replace adapter in{' '}
            <code
              style={{
                fontFamily: 'monospace',
                background: 'var(--color-bg-alt)',
                padding: '1px 6px',
                borderRadius: 4,
              }}
            >
              bluetoothService.ts
            </code>{' '}
            with the real Capacitor plugin when building the APK
          </div>
        </div>
      </div>

      {/* ── Permissions ──────────────────────────────────────── */}
      <div className="card mb-6">
        <h4
          style={{
            marginBottom: 'var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}
        >
          <Shield size={18} aria-hidden="true" /> Android Permissions Required
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {[
            { name: 'BLUETOOTH_SCAN', desc: 'Scan for nearby BT devices (Android 12+)' },
            { name: 'BLUETOOTH_CONNECT', desc: 'Connect to paired devices (Android 12+)' },
            { name: 'BLUETOOTH / BLUETOOTH_ADMIN', desc: 'Legacy Bluetooth (Android ≤ 11)' },
            { name: 'ACCESS_FINE_LOCATION', desc: 'Required for BLE scanning (Android < 12)' },
          ].map((p) => (
            <div key={p.name} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
              <CheckCircle
                size={16}
                style={{ color: 'var(--color-on-success)', flexShrink: 0, marginTop: 2 }}
                aria-hidden="true"
              />
              <div>
                <code
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 'var(--text-xs)',
                    background: 'var(--color-bg-alt)',
                    padding: '2px 6px',
                    borderRadius: 4,
                  }}
                >
                  {p.name}
                </code>
                <span
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-tertiary)',
                    marginLeft: 8,
                  }}
                >
                  {p.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Troubleshooting ──────────────────────────────────── */}
      <div className="card">
        <h4
          style={{
            marginBottom: 'var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}
        >
          <Smartphone size={18} aria-hidden="true" /> Connection Troubleshooting
        </h4>
        <ol
          style={{
            paddingLeft: 'var(--space-5)',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--text-sm)',
            lineHeight: 2,
          }}
        >
          <li>Ensure Bluetooth is enabled on your Android phone.</li>
          <li>Grant all Bluetooth permissions when prompted.</li>
          <li>Make sure the ESP32 is powered on and running the firmware.</li>
          <li>For Web Bluetooth: open the app on Chrome over HTTPS or localhost.</li>
          <li>For BT Classic SPP: pair the ESP32 in Android Settings first.</li>
          <li>For BLE: no pre-pairing needed — Scan, then Connect.</li>
          <li>Stay within 5–10 m of the ESP32 for a stable connection.</li>
          <li>On failure: Disconnect → wait 2 s → Scan again.</li>
        </ol>
      </div>

      {/* ── Inline styles ────────────────────────────────────── */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        @keyframes radar-pulse {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(2.8); opacity: 0; }
        }

        .bt-radar {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bt-radar-ring {
          position: absolute;
          border-radius: 50%;
          border: 2px solid var(--color-accent);
          width: 80px;
          height: 80px;
          animation: radar-pulse 2s ease-out infinite;
          pointer-events: none;
        }
        .ring-1 { animation-delay: 0s; }
        .ring-2 { animation-delay: 0.6s; }
        .ring-3 { animation-delay: 1.2s; }
      `}</style>
    </div>
  );
}
