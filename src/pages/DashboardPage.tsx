// ============================================================
// DASHBOARD PAGE
// ============================================================
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, Wifi, WifiOff, Calendar, Lightbulb, ArrowRight,
  Bluetooth, PowerOff, Clock, AlertTriangle,
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { useBluetooth } from '../services/bluetooth/useBluetooth';
import DeviceCard from '../components/DeviceCard';
import { format } from 'date-fns';

export default function DashboardPage() {
  const devices = useAppStore((s) => s.devices);
  const schedules = useAppStore((s) => s.schedules);
  const preferences = useAppStore((s) => s.preferences);
  const bluetooth = useAppStore((s) => s.bluetooth);
  const { scan, connect, disconnect } = useBluetooth();

  const now = new Date();
  const greeting = getGreeting(now);

  const stats = useMemo(() => {
    const total = devices.length;
    const onCount = devices.filter((d) => d.confirmedState === 'on').length;
    const supported = devices.filter((d) => d.support === 'supported').length;
    const upcoming = schedules.filter((s) => s.enabled).length;
    return { total, onCount, supported, upcoming };
  }, [devices, schedules]);

  // Quick-access supported light devices
  const supportedLights = devices.filter(
    (d) => d.category === 'lighting' && d.support === 'supported'
  );

  // All ON devices for overview grid
  const activeDevices = devices.filter((d) => d.confirmedState === 'on');

  // Recently updated devices for the overview section (show supported first, then demo)
  const overviewDevices = [
    ...devices.filter((d) => d.support === 'supported'),
    ...devices.filter((d) => d.support === 'demo').slice(0, 4),
    ...devices.filter((d) => d.support === 'unconfigured').slice(0, 2),
  ].slice(0, 8);

  const isConnected = bluetooth.status === 'connected';

  async function handleConnectScan() {
    await scan();
    // After scan finds a device, auto-connect if address found
    setTimeout(() => {
      const { deviceAddress: addr, deviceName: devName } = useAppStore.getState().bluetooth;
      if (addr && devName) connect(addr, devName);
    }, 1500);
  }

  return (
    <div>
      {/* Demo banner */}
      {preferences.demoMode && (
        <div className="demo-banner" role="note" aria-label="Demo mode active">
          <AlertTriangle size={16} aria-hidden="true" />
          <span>
            <strong>DEMO MODE</strong> — Device controls are simulated. No real hardware is connected.
          </span>
          <Link to="/settings" style={{ marginLeft: 'auto', color: 'inherit', textDecoration: 'underline', fontSize: 'var(--text-xs)' }}>
            Settings
          </Link>
        </div>
      )}

      {/* Page header */}
      <div className="page-header">
        <p style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)' }}>
          {greeting}
        </p>
        <h2>Your Home</h2>
        <p style={{ fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>
          {format(now, 'EEEE, d MMMM yyyy')} &middot; {format(now, 'hh:mm a')}
        </p>
      </div>

      {/* Summary stat cards */}
      <div className="grid-4 mb-6">
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)' }}>
            <Zap size={20} aria-hidden="true" />
          </div>
          <div className="stat-card-value">{stats.total}</div>
          <div className="stat-card-label">Configured Devices</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--color-state-on-bg)', color: 'var(--color-state-on)' }}>
            <Lightbulb size={20} aria-hidden="true" />
          </div>
          <div className="stat-card-value">{stats.onCount}</div>
          <div className="stat-card-label">Devices Reported ON</div>
        </div>

        <div className="stat-card">
          <div
            className="stat-card-icon"
            style={{
              background: isConnected ? 'var(--color-success-bg)' : 'var(--color-state-off-bg)',
              color: isConnected ? 'var(--color-on-success)' : 'var(--color-text-tertiary)',
            }}
          >
            {isConnected ? <Wifi size={20} aria-hidden="true" /> : <WifiOff size={20} aria-hidden="true" />}
          </div>
          <div className="stat-card-value" style={{ fontSize: 'var(--text-xl)' }}>
            {bluetooth.status === 'connected' ? 'Online' : 'Offline'}
          </div>
          <div className="stat-card-label">Bluetooth Status</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--color-info-bg)', color: 'var(--color-on-info)' }}>
            <Calendar size={20} aria-hidden="true" />
          </div>
          <div className="stat-card-value">{stats.upcoming}</div>
          <div className="stat-card-label">Active Schedules</div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="section-header mb-4">
        <h3>Quick Actions</h3>
      </div>
      <div className="flex gap-3 mb-6" style={{ flexWrap: 'wrap' }}>
        {!isConnected ? (
          <button
            className="btn btn-primary"
            onClick={handleConnectScan}
            disabled={bluetooth.status === 'connecting' || bluetooth.status === 'scanning'}
          >
            <Bluetooth size={16} />
            {bluetooth.status === 'connecting' ? 'Connecting…' :
             bluetooth.status === 'scanning' ? 'Scanning…' : 'Connect Bluetooth'}
          </button>
        ) : (
          <button className="btn btn-secondary" onClick={disconnect}>
            <WifiOff size={16} />
            Disconnect
          </button>
        )}

        <Link to="/devices" className="btn btn-secondary">
          <Zap size={16} />
          All Devices
        </Link>

        <Link to="/schedules" className="btn btn-secondary">
          <Calendar size={16} />
          Schedules
        </Link>
      </div>

      {/* Supported HW device overview */}
      {supportedLights.length > 0 && (
        <>
          <div className="section-divider">
            <div className="section-divider-line" />
            <span className="section-divider-label">Hardware — Confirmed Outputs</span>
            <div className="section-divider-line" />
          </div>
          <div className="grid-auto mb-6">
            {supportedLights.map((d) => (
              <DeviceCard key={d.id} device={d} />
            ))}
          </div>
        </>
      )}

      {/* Overview grid */}
      <div className="section-header">
        <h3>Device Overview</h3>
        <Link to="/devices" className="btn btn-ghost btn-sm" style={{ gap: 'var(--space-1)' }}>
          View all <ArrowRight size={14} />
        </Link>
      </div>
      <div className="grid-auto">
        {overviewDevices.map((d) => (
          <DeviceCard key={d.id} device={d} />
        ))}
      </div>

      {/* Upcoming schedules */}
      {schedules.length > 0 && (
        <>
          <div className="section-header mt-6">
            <h3>Upcoming Schedules</h3>
            <Link to="/schedules" className="btn btn-ghost btn-sm">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <div
              className="alert info"
              style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-xs)' }}
            >
              <Clock size={14} />
              Schedules run only while this app is open. Hardware execution requires ESP32 RTC firmware.
            </div>
            {schedules.filter((s) => s.enabled).slice(0, 3).map((sched) => {
              const devName = devices.find((d) => d.id === sched.deviceIds[0])?.name ?? 'Device';
              const [h, m] = sched.time.split(':').map(Number);
              const period = h >= 12 ? 'PM' : 'AM';
              const h12 = h % 12 || 12;
              return (
                <div key={sched.id} className="schedule-card">
                  <div className="schedule-time-block">
                    <div className="time">{String(h12).padStart(2,'0')}:{String(m).padStart(2,'0')}</div>
                    <div className="period">{period}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                      {sched.name}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginTop: 2 }}>
                      {devName} · {sched.action.toUpperCase()} · {sched.repeat}
                    </div>
                  </div>
                  <span className={`device-status-badge ${sched.action === 'on' ? 'on' : 'off'}`}>
                    {sched.action.toUpperCase()}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function getGreeting(now: Date): string {
  const h = now.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
