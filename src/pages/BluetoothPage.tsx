// ============================================================
// BLUETOOTH PAGE — Professional Mobile BLE Screen & Accurate States
// ============================================================
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bluetooth, BluetoothOff, RefreshCw, Unlink,
  AlertCircle, Info, Shield, CheckCircle, WifiOff, Settings,
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { useBluetooth } from '../services/bluetooth/useBluetooth';
import { bluetoothAdapter, getBLEConfig } from '../services/bluetooth/bluetoothService';

type FoundDevice = { name: string; address: string };

const isWebBTSupported = 'bluetooth' in navigator;
const isHTTPS =
  typeof location !== 'undefined' &&
  (location.protocol === 'https:' || location.hostname === 'localhost');

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

export default function BluetoothPage() {
  const bluetooth = useAppStore((s) => s.bluetooth);
  const { connect, disconnect } = useBluetooth();
  const [foundDevices, setFoundDevices] = useState<FoundDevice[]>([]);
  const [scanning, setScanning] = useState(false);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);
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
    ? 'Connection Note'
    : 'Ready to Connect';

  // ---- Scan handler with gentle cancellation handling ---------------------------
  async function handleScan() {
    setFoundDevices([]);
    setScanning(true);
    setInfoNotice(null);
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
      // Check if this was a normal user cancellation of the device chooser
      const isCancellation =
        msg.toLowerCase().includes('cancelled') ||
        msg.toLowerCase().includes('canceled') ||
        msg.toLowerCase().includes('user cancelled');

      if (isCancellation) {
        setBluetooth({ status: 'disconnected', errorMessage: null });
        setInfoNotice('Device selection cancelled. Tap "Scan for Devices" to try again.');
      } else {
        setBluetooth({ status: 'error', errorMessage: msg });
      }
    } finally {
      setScanning(false);
    }
  }

  async function handleDisconnect() {
    await disconnect();
    setFoundDevices([]);
    setInfoNotice(null);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="page-header" style={{ marginBottom: 4 }}>
        <h2>Bluetooth</h2>
        <p>Manage BLE device connection and pairing</p>
      </div>

      {/* ── Browser support warnings ─────────────────────────── */}
      {!isWebBTSupported && (
        <div className="alert warning">
          <WifiOff size={16} aria-hidden="true" />
          <span>
            Web Bluetooth is not available in this browser.
            Use <strong>Chrome on Android</strong> or install the app as a PWA.
          </span>
        </div>
      )}
      {isWebBTSupported && !isHTTPS && (
        <div className="alert warning">
          <AlertCircle size={16} aria-hidden="true" />
          <span>
            Web Bluetooth requires HTTPS. Please open the <strong>Vercel URL</strong>.
          </span>
        </div>
      )}

      {/* ── Status header card ───────────────────────────────── */}
      <div
        className="glass-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '24px 20px',
          gap: 16,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 20,
        }}
      >
        {/* Radar animation or static icon */}
        <div
          className="bt-radar"
          style={{ position: 'relative', width: 76, height: 76, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
            {isError ? (
              <BluetoothOff size={30} aria-hidden="true" />
            ) : (
              <Bluetooth size={30} aria-hidden="true" />
            )}
          </div>
        </div>

        {/* Status label */}
        <div style={{ width: '100%' }}>
          <h3 style={{ margin: 0, marginBottom: 4, fontSize: 'var(--text-lg)' }}>{statusLabel}</h3>
          {isConnected && bluetooth.deviceAddress && (
            <div
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-tertiary)',
                fontFamily: 'monospace',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {bluetooth.deviceAddress}
              <SignalBars strength={3} />
            </div>
          )}

          {/* User cancellation notice (neutral, non-critical) */}
          {infoNotice && (
            <div
              style={{
                marginTop: 12,
                padding: '10px 14px',
                borderRadius: 12,
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                color: 'var(--color-text-secondary)',
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                textAlign: 'left',
              }}
            >
              <Info size={15} style={{ color: '#3b82f6', flexShrink: 0 }} />
              <span>{infoNotice}</span>
            </div>
          )}

          {/* Actual system error */}
          {isError && bluetooth.errorMessage && (
            <div
              className="alert error"
              style={{ marginTop: 12, textAlign: 'left', fontSize: 12 }}
            >
              <AlertCircle size={15} aria-hidden="true" />
              <span>{bluetooth.errorMessage}</span>
            </div>
          )}
        </div>

        {/* Action button */}
        {isConnected ? (
          <button
            className="btn btn-secondary btn-lg"
            onClick={handleDisconnect}
            style={{ width: '100%', maxWidth: 280, borderRadius: 'var(--radius-full)' }}
          >
            <Unlink size={18} aria-hidden="true" /> Disconnect
          </button>
        ) : (
          <button
            className="btn btn-primary btn-lg"
            onClick={handleScan}
            disabled={scanning || isConnecting || !isWebBTSupported}
            aria-label={scanning ? 'Scanning for devices' : 'Scan for Bluetooth devices'}
            style={{
              width: '100%',
              maxWidth: 280,
              borderRadius: 'var(--radius-full)',
              background: '#10b981',
              borderColor: '#10b981',
            }}
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
          className="bt-connected-info glass-card"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '14px 16px',
            borderRadius: 14,
          }}
        >
          <CheckCircle size={22} style={{ color: 'var(--color-accent)', flexShrink: 0 }} aria-hidden="true" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>
              {bluetooth.deviceName}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
              BLE Connected · ESP32 Hardware
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleDisconnect}>
            Disconnect
          </button>
        </div>
      )}

      {/* ── Found devices list ───────────────────────────────── */}
      {foundDevices.length > 0 && !isConnected && (
        <div className="card">
          <h4 style={{ marginBottom: 12, fontSize: 'var(--text-base)' }}>Discovered Devices</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {foundDevices.map((device) => (
              <div
                key={device.address}
                className="found-device-card glass-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 14,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: 'rgba(16,185,129,0.12)',
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
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                    {device.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
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
                  style={{ fontSize: 12, padding: '6px 14px' }}
                >
                  Connect
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── BLE UUID configuration ───────────────────────────── */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h4 style={{ margin: 0, fontSize: 'var(--text-base)' }}>ESP32 BLE Configuration</h4>
          <Link
            to="/settings"
            style={{
              fontSize: 12,
              color: 'var(--color-accent)',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Edit in Settings →
          </Link>
        </div>
        <div
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-secondary)',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div>
            <span style={{ color: 'var(--color-text-tertiary)' }}>Service UUID: </span>
            <code
              style={{
                fontFamily: 'monospace',
                background: 'var(--color-bg-alt)',
                padding: '2px 6px',
                borderRadius: 4,
                wordBreak: 'break-all',
              }}
            >
              {bleConfig.serviceUUID}
            </code>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-tertiary)' }}>TX Char UUID: </span>
            <code
              style={{
                fontFamily: 'monospace',
                background: 'var(--color-bg-alt)',
                padding: '2px 6px',
                borderRadius: 4,
                wordBreak: 'break-all',
              }}
            >
              {bleConfig.txCharUUID}
            </code>
          </div>
        </div>
      </div>

      {/* ── Architecture info ────────────────────────────────── */}
      <div className="card">
        <h4 style={{ marginBottom: 10, fontSize: 'var(--text-base)' }}>Bluetooth Architecture</h4>
        <div className="alert info" style={{ marginBottom: 12, fontSize: 12 }}>
          <Info size={15} aria-hidden="true" />
          <div>
            {isWebBTSupported ? (
              <>
                <strong>Web Bluetooth Active</strong> — Communicating directly with nearby ESP32
                over standard GATT BLE services.
              </>
            ) : (
              <>
                <strong>Demo Mode Active</strong> — MockBluetoothAdapter active for non-BLE browsers.
              </>
            )}
          </div>
        </div>
        <div
          style={{
            fontSize: 12,
            color: 'var(--color-text-secondary)',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <div><strong>Target hardware:</strong> ESP32-WROOM-32</div>
          <div>
            <strong>Command syntax:</strong>{' '}
            <code
              style={{
                fontFamily: 'monospace',
                background: 'var(--color-bg-alt)',
                padding: '1px 5px',
                borderRadius: 4,
              }}
            >
              L1_ON\n
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
