// ============================================================
// DASHBOARD PAGE — Premium Mobile-First Redesign
// ============================================================
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, Wifi, WifiOff, Calendar, Lightbulb, ArrowRight,
  Bluetooth, Clock, AlertTriangle, Power, Sliders, Bell
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { useBluetooth } from '../services/bluetooth/useBluetooth';
import DeviceCard from '../components/DeviceCard';
import { showToast } from '../components/ToastContainer';
import { format } from 'date-fns';

export default function DashboardPage() {
  const devices = useAppStore((s) => s.devices);
  const schedules = useAppStore((s) => s.schedules);
  const preferences = useAppStore((s) => s.preferences);
  const bluetooth = useAppStore((s) => s.bluetooth);
  const setDeviceState = useAppStore((s) => s.setDeviceState);
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

  // Recently updated devices for overview section
  const overviewDevices = [
    ...devices.filter((d) => d.support === 'supported'),
    ...devices.filter((d) => d.support === 'demo').slice(0, 4),
    ...devices.filter((d) => d.support === 'unconfigured').slice(0, 2),
  ].slice(0, 8);

  const isConnected = bluetooth.status === 'connected';

  async function handleConnectScan() {
    await scan();
    setTimeout(() => {
      const { deviceAddress: addr, deviceName: devName } = useAppStore.getState().bluetooth;
      if (addr && devName) connect(addr, devName);
    }, 1500);
  }

  function handleAllLights(state: 'on' | 'off') {
    const lights = devices.filter((d) => d.category === 'lighting');
    lights.forEach((l) => setDeviceState(l.id, state));
    showToast(`Turned ${state.toUpperCase()} all ${lights.length} lights`, state === 'on' ? 'success' : 'info');
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

      {/* ── Hero Section ── */}
      <div
        className="glass-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-5) var(--space-6)',
          marginBottom: 'var(--space-5)',
          gap: 'var(--space-4)',
        }}
      >
        <div>
          <p className="text-xs text-tertiary" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginBottom: 2 }}>
            {greeting}
          </p>
          <h2 style={{ margin: 0, lineHeight: 1.1 }}>Your Home</h2>
          <p style={{ fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)', color: 'var(--color-text-secondary)' }}>
            {format(now, 'EEEE, d MMMM · hh:mm a')}
          </p>
        </div>
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            background: isConnected ? 'var(--color-state-on-bg)' : 'var(--color-state-off-bg)',
            color: isConnected ? 'var(--color-state-on)' : 'var(--color-text-tertiary)',
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            border: '1px solid',
            borderColor: isConnected ? 'var(--color-state-on)' : 'var(--color-border)',
            whiteSpace: 'nowrap',
            transition: 'all var(--transition-base)',
          }}
        >
          <span style={{ fontSize: 10 }}>{isConnected ? '●' : '○'}</span>
          {isConnected ? 'Connected' : 'Offline'}
        </div>
      </div>

      {/* ── Stats Grid 2×2 on mobile ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-5)',
        }}
      >
        <div className="stat-card glass-card">
          <div className="stat-card-icon" style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)' }}>
            <Zap size={20} aria-hidden="true" />
          </div>
          <div className="stat-card-value">{stats.total}</div>
          <div className="stat-card-label">Configured Devices</div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-card-icon" style={{ background: 'var(--color-state-on-bg)', color: 'var(--color-state-on)' }}>
            <Lightbulb size={20} aria-hidden="true" />
          </div>
          <div className="stat-card-value">{stats.onCount}</div>
          <div className="stat-card-label">Devices ON</div>
        </div>

        <div className="stat-card glass-card">
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
          <div className="stat-card-label">BT Status</div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-card-icon" style={{ background: 'var(--color-info-bg)', color: 'var(--color-on-info)' }}>
            <Calendar size={20} aria-hidden="true" />
          </div>
          <div className="stat-card-value">{stats.upcoming}</div>
          <div className="stat-card-label">Active Schedules</div>
        </div>
      </div>

      {/* ── Quick Actions — Horizontal Scrollable Row ── */}
      <div className="section-header" style={{ marginBottom: 'var(--space-3)' }}>
        <h3>Quick Actions</h3>
      </div>
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-2)',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch' as React.CSSProperties['WebkitOverflowScrolling'],
          paddingBottom: 'var(--space-1)',
          marginBottom: 'var(--space-5)',
        }}
      >
        <style>{`.quick-actions-scroll::-webkit-scrollbar{display:none}`}</style>

        {/* Master Light Controls */}
        <button
          className="btn btn-secondary"
          style={{ flexShrink: 0, borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap', borderColor: '#10b981', color: '#10b981' }}
          onClick={() => handleAllLights('on')}
        >
          <Power size={15} /> All Lights ON
        </button>
        <button
          className="btn btn-secondary"
          style={{ flexShrink: 0, borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap' }}
          onClick={() => handleAllLights('off')}
        >
          <Power size={15} /> All Lights OFF
        </button>

        {!isConnected ? (
          <button
            className="btn btn-primary"
            style={{ flexShrink: 0, borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap' }}
            onClick={handleConnectScan}
            disabled={bluetooth.status === 'connecting' || bluetooth.status === 'scanning'}
          >
            <Bluetooth size={16} />
            {bluetooth.status === 'connecting' ? 'Connecting…' :
             bluetooth.status === 'scanning' ? 'Scanning…' : 'Connect BT'}
          </button>
        ) : (
          <button
            className="btn btn-secondary"
            style={{ flexShrink: 0, borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap' }}
            onClick={disconnect}
          >
            <WifiOff size={16} />
            Disconnect
          </button>
        )}

        <Link
          to="/smart-modes"
          className="btn btn-secondary"
          style={{ flexShrink: 0, borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap' }}
        >
          <Sliders size={16} />
          Smart Modes
        </Link>

        <Link
          to="/notifications"
          className="btn btn-secondary"
          style={{ flexShrink: 0, borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap' }}
        >
          <Bell size={16} />
          Notifications
        </Link>

        <Link
          to="/devices"
          className="btn btn-secondary"
          style={{ flexShrink: 0, borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap' }}
        >
          <Zap size={16} />
          All Devices
        </Link>

        <Link
          to="/schedules"
          className="btn btn-secondary"
          style={{ flexShrink: 0, borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap' }}
        >
          <Calendar size={16} />
          Schedules
        </Link>

        <Link
          to="/rooms"
          className="btn btn-secondary"
          style={{ flexShrink: 0, borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap' }}
        >
          Rooms
        </Link>

        <Link
          to="/bluetooth"
          className="btn btn-secondary"
          style={{ flexShrink: 0, borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap' }}
        >
          <Bluetooth size={16} />
          Bluetooth
        </Link>
      </div>

      {/* ── Supported HW device section ── */}
      {supportedLights.length > 0 && (
        <>
          <div className="section-divider">
            <div className="section-divider-line" />
            <span className="section-divider-label">Hardware — Confirmed Outputs</span>
            <div className="section-divider-line" />
          </div>
          <div className="grid-auto" style={{ marginBottom: 'var(--space-5)' }}>
            {supportedLights.map((d) => (
              <DeviceCard key={d.id} device={d} />
            ))}
          </div>
        </>
      )}

      {/* ── Device Overview ── */}
      <div className="section-header" style={{ marginBottom: 'var(--space-3)' }}>
        <h3>Device Overview</h3>
        <Link to="/devices" className="btn btn-ghost btn-sm" style={{ gap: 'var(--space-1)' }}>
          View All <ArrowRight size={14} />
        </Link>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-5)',
        }}
      >
        {overviewDevices.map((d) => (
          <DeviceCard key={d.id} device={d} />
        ))}
      </div>

      {/* ── Upcoming Schedules — minimal list ── */}
      {schedules.length > 0 && (
        <>
          <div className="section-header" style={{ marginBottom: 'var(--space-3)' }}>
            <h3>Upcoming Schedules</h3>
            <Link to="/schedules" className="btn btn-ghost btn-sm">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div
            className="glass-card"
            style={{ display: 'flex', flexDirection: 'column', gap: 0, overflow: 'hidden', marginBottom: 'var(--space-5)' }}
          >
            <div
              className="alert info"
              style={{ margin: 'var(--space-3) var(--space-4) 0', fontSize: 'var(--text-xs)', borderRadius: 'var(--radius-md)' }}
            >
              <Clock size={14} />
              Schedules run only while this app is open.
            </div>
            {schedules.filter((s) => s.enabled).slice(0, 3).map((sched, idx, arr) => {
              const devName = devices.find((d) => d.id === sched.deviceIds[0])?.name ?? 'Device';
              const [h, m] = sched.time.split(':').map(Number);
              const period = h >= 12 ? 'PM' : 'AM';
              const h12 = h % 12 || 12;
              return (
                <div
                  key={sched.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-3) var(--space-4)',
                    borderBottom: idx < arr.length - 1 ? '1px solid var(--color-border-subtle)' : undefined,
                  }}
                >
                  <div style={{ textAlign: 'center', minWidth: 44 }}>
                    <div style={{ fontWeight: 700, fontSize: 'var(--text-base)', fontFamily: 'monospace', color: 'var(--color-text-primary)', lineHeight: 1 }}>
                      {String(h12).padStart(2, '0')}:{String(m).padStart(2, '0')}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', fontWeight: 600 }}>{period}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {sched.name}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                      {devName} · {sched.repeat}
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
