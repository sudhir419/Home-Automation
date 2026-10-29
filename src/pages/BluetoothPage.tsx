// ============================================================
// BLUETOOTH PAGE
// ============================================================
import { useState } from 'react';
import {
  Bluetooth, BluetoothOff, RefreshCw, Link2, Unlink,
  AlertCircle, Info, Shield, Smartphone, CheckCircle,
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { useBluetooth } from '../services/bluetooth/useBluetooth';
import { bluetoothAdapter } from '../services/bluetooth/bluetoothService';

type FoundDevice = { name: string; address: string };

export default function BluetoothPage() {
  const bluetooth = useAppStore((s) => s.bluetooth);
  const { connect, disconnect } = useBluetooth();
  const [foundDevices, setFoundDevices] = useState<FoundDevice[]>([]);
  const [scanning, setScanning] = useState(false);
  const addActivity = useAppStore((s) => s.addActivity);
  const setBluetooth = useAppStore((s) => s.setBluetooth);

  const isConnected = bluetooth.status === 'connected';
  const isConnecting = bluetooth.status === 'connecting';
  const isError = bluetooth.status === 'error';

  const iconClass =
    isConnected ? 'connected' :
    isConnecting || scanning ? 'connecting' :
    isError ? 'error' : 'disconnected';

  async function handleScan() {
    setFoundDevices([]);
    setScanning(true);
    setBluetooth({ status: 'scanning', errorMessage: null });
    addActivity({ category: 'bluetooth', level: 'info', title: 'Scanning for devices…', detail: null, isHardwareConfirmed: false });
    try {
      await bluetoothAdapter.startScan((name, address) => {
        setFoundDevices((prev) => {
          const exists = prev.some((d) => d.address === address);
          return exists ? prev : [...prev, { name, address }];
        });
        setBluetooth({ status: 'ready', deviceName: name, deviceAddress: address });
        addActivity({ category: 'bluetooth', level: 'success', title: `Found: ${name}`, detail: address, isHardwareConfirmed: false });
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

  return (
    <div>
      <div className="page-header">
        <h2>Bluetooth</h2>
        <p>Manage device connection and pairing</p>
      </div>

      {/* Main status card */}
      <div className={`bt-status-card ${iconClass} mb-6`}>
        <div className={`bt-icon-large ${iconClass}`}>
          {isConnected
            ? <Bluetooth size={36} aria-hidden="true" />
            : isError
            ? <BluetoothOff size={36} aria-hidden="true" />
            : <Bluetooth size={36} aria-hidden="true" />}
        </div>

        <h3 style={{ marginBottom: 'var(--space-2)' }}>
          {isConnected
            ? `Connected to ${bluetooth.deviceName ?? 'device'}`
            : isConnecting ? 'Connecting…'
            : scanning ? 'Scanning for devices…'
            : isError ? 'Connection Error'
            : 'Not Connected'}
        </h3>

        {bluetooth.deviceAddress && (
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-4)' }}>
            {bluetooth.deviceAddress}
          </p>
        )}

        {bluetooth.errorMessage && (
          <div className="alert error" style={{ marginBottom: 'var(--space-4)', textAlign: 'left' }}>
            <AlertCircle size={16} aria-hidden="true" />
            {bluetooth.errorMessage}
          </div>
        )}

        {isConnected ? (
          <button className="btn btn-secondary btn-lg" onClick={handleDisconnect}>
            <Unlink size={18} aria-hidden="true" /> Disconnect
          </button>
        ) : (
          <button
            className="btn btn-primary btn-lg"
            onClick={handleScan}
            disabled={scanning || isConnecting}
            aria-label={scanning ? 'Scanning for devices' : 'Scan for Bluetooth devices'}
          >
            <RefreshCw
              size={18}
              aria-hidden="true"
              style={scanning ? { animation: 'spin 1s linear infinite' } : {}}
            />
            {scanning ? 'Scanning…' : 'Scan for Devices'}
          </button>
        )}

        {bluetooth.lastConnectedAt && !isConnected && (
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-disabled)', marginTop: 'var(--space-4)' }}>
            Last connected: {new Date(bluetooth.lastConnectedAt).toLocaleString()}
          </p>
        )}
      </div>

      {/* Found devices list */}
      {foundDevices.length > 0 && !isConnected && (
        <div className="card mb-6">
          <h4 style={{ marginBottom: 'var(--space-4)' }}>Found Devices</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {foundDevices.map((device) => (
              <div
                key={device.address}
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                  padding: 'var(--space-3) var(--space-4)',
                  background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 'var(--radius-md)',
                  background: 'var(--color-accent-light)', color: 'var(--color-accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Bluetooth size={16} aria-hidden="true" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                    {device.name}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                    {device.address}
                  </div>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => connect(device.address, device.name)}
                  disabled={isConnecting}
                  aria-label={`Connect to ${device.name}`}
                >
                  <Link2 size={13} aria-hidden="true" /> Connect
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Architecture info */}
      <div className="card mb-6">
        <h4 style={{ marginBottom: 'var(--space-4)' }}>Bluetooth Architecture</h4>
        <div className="alert info" style={{ marginBottom: 'var(--space-4)' }}>
          <Info size={16} aria-hidden="true" />
          <div>
            <strong>Demo Mode Active</strong> — The MockBluetoothAdapter simulates scanning and
            connection. No real hardware is used in browser/desktop mode.
          </div>
        </div>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 2 }}>
          <div><strong>Current adapter:</strong> MockBluetoothAdapter (demo)</div>
          <div><strong>Target hardware:</strong> ESP32 development board (model TBC)</div>
          <div><strong>Protocol:</strong> BT Classic SPP or BLE — to be confirmed with firmware</div>
          <div>
            <strong>Command format:</strong>{' '}
            <code style={{ fontFamily: 'monospace', background: 'var(--color-bg-alt)', padding: '1px 6px', borderRadius: 4 }}>
              L1_ON\n
            </code>
            {' '}(newline-terminated ASCII)
          </div>
          <div><strong>APK plugin:</strong> Replace MockAdapter in <code style={{ fontFamily: 'monospace', background: 'var(--color-bg-alt)', padding: '1px 6px', borderRadius: 4 }}>bluetoothService.ts</code> with the real Capacitor plugin when building the APK</div>
        </div>
      </div>

      {/* Permissions */}
      <div className="card mb-6">
        <h4 style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
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
              <CheckCircle size={16} style={{ color: 'var(--color-on-success)', flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
              <div>
                <code style={{ fontFamily: 'monospace', fontSize: 'var(--text-xs)', background: 'var(--color-bg-alt)', padding: '2px 6px', borderRadius: 4 }}>
                  {p.name}
                </code>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginLeft: 8 }}>
                  {p.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Troubleshooting */}
      <div className="card">
        <h4 style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Smartphone size={18} aria-hidden="true" /> Connection Troubleshooting
        </h4>
        <ol style={{ paddingLeft: 'var(--space-5)', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 2 }}>
          <li>Ensure Bluetooth is enabled on your Android phone.</li>
          <li>Grant all Bluetooth permissions when prompted.</li>
          <li>Make sure the ESP32 is powered on and running the firmware.</li>
          <li>For BT Classic SPP: pair the ESP32 in Android Settings first.</li>
          <li>For BLE: no pre-pairing needed — Scan, then Connect.</li>
          <li>Stay within 5–10 m of the ESP32 for a stable connection.</li>
          <li>On failure: Disconnect → wait 2 s → Scan again.</li>
        </ol>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
