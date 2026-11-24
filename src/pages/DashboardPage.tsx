// ============================================================
// SPATIAL SMART-HOME FLAGSHIP DASHBOARD
// Ultra-Premium Spatial Bento Grid · Apple HomeKit & Tesla/Rivian Grade
// 5 Choreographed Modes, Rotary Dial, Touch Dimmer & Live Telemetry
// ============================================================
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Wifi, WifiOff, Calendar, Lightbulb, ArrowRight,
  Bluetooth, Clock, AlertTriangle, Power, Sliders, Bell, Plus,
  ShieldCheck, Thermometer,
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { useBluetooth } from '../services/bluetooth/useBluetooth';
import DeviceCard from '../components/DeviceCard';
import DeviceModal from '../components/DeviceModal';
import { showToast } from '../components/ToastContainer';
import { format } from 'date-fns';

// Spatial Motion Architecture Components
import { SpatialModeId, SPATIAL_MODES } from '../styles/modes';
import { SpatialAmbientMesh } from '../components/spatial/SpatialAmbientMesh';
import { SpatialModeDock } from '../components/spatial/SpatialModeDock';
import { RotaryThermostatDial } from '../components/spatial/RotaryThermostatDial';
import { SpatialDimmerCard } from '../components/spatial/SpatialDimmerCard';
import { SpatialTelemetryHub } from '../components/spatial/SpatialTelemetryHub';

export default function DashboardPage() {
  const devices = useAppStore((s) => s.devices);
  const rooms = useAppStore((s) => s.rooms);
  const schedules = useAppStore((s) => s.schedules);
  const preferences = useAppStore((s) => s.preferences);
  const bluetooth = useAppStore((s) => s.bluetooth);
  const setDeviceState = useAppStore((s) => s.setDeviceState);
  const setPreference = useAppStore((s) => s.setPreference);
  const { scan, connect, disconnect } = useBluetooth();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<SpatialModeId>(
    (preferences.activeMode as SpatialModeId) || 'morning'
  );
  const [selectedRoom, setSelectedRoom] = useState<string>('all');

  const currentModeConfig = SPATIAL_MODES[activeMode] || SPATIAL_MODES.morning;
  const [targetTemp, setTargetTemp] = useState<number>(currentModeConfig.temperature);

  const now = new Date();
  const greeting = getGreeting(now);

  const stats = useMemo(() => {
    const total = devices.length;
    const onCount = devices.filter((d) => d.confirmedState === 'on').length;
    const supported = devices.filter((d) => d.support === 'supported').length;
    const upcoming = schedules.filter((s) => s.enabled).length;
    return { total, onCount, supported, upcoming };
  }, [devices, schedules]);

  // Lighting devices for spatial touch dimmer cards
  const lightingDevices = useMemo(() => {
    return devices.filter((d) => d.category === 'lighting');
  }, [devices]);

  // Quick-access supported light devices
  const supportedLights = useMemo(() => {
    return devices.filter((d) => d.category === 'lighting' && d.support === 'supported');
  }, [devices]);

  // Devices filtered by selected room for overview
  const displayedDevices = useMemo(() => {
    if (selectedRoom === 'all') return devices;
    return devices.filter((d) => d.roomId === selectedRoom);
  }, [devices, selectedRoom]);

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

  // Handle mode selection transition with device states & temperature
  const handleSelectMode = (modeId: SpatialModeId) => {
    setActiveMode(modeId);
    setPreference('activeMode', modeId);
    const config = SPATIAL_MODES[modeId];
    setTargetTemp(config.temperature);

    // Apply mode-specific device presets
    Object.entries(config.targetDeviceStates).forEach(([devId, state]) => {
      if (state === 'on') setDeviceState(devId, 'on');
      else if (state === 'off') setDeviceState(devId, 'off');
    });

    showToast(`${config.name} Mode active · ${config.tagline}`, 'success');
  };

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100%' }}>
      {/* ── GPU-Composited Ambient Mesh Canvas (Pro-Tip verified) ── */}
      <SpatialAmbientMesh activeMode={activeMode} />

      {/* Main Content Layer */}
      <div style={{ position: 'relative', zIndex: 10 }}>
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

        {/* ── Spatial Hero & Live Status Bar ── */}
        <div
          className="glass-card"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 24px',
            marginBottom: '18px',
            borderRadius: '24px',
            background: 'rgba(255, 255, 255, 0.035)',
            backdropFilter: 'blur(28px) saturate(190%)',
            WebkitBackdropFilter: 'blur(28px) saturate(190%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 12px 36px rgba(0,0,0,0.45)',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono-numbers)' }}>
              {greeting}
            </p>
            <h2 style={{ margin: 0, lineHeight: 1.15, fontSize: '24px', fontFamily: 'var(--font-spatial-heading, "Plus Jakarta Sans", sans-serif)', fontWeight: 800 }}>
              Spatial Residence
            </h2>
            <p style={{ fontSize: '13px', marginTop: 2, color: 'rgba(255, 255, 255, 0.65)', margin: 0 }}>
              {format(now, 'EEEE, d MMMM · hh:mm a')}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Live Mode Tag */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: '9999px',
                background: currentModeConfig.badgeBg,
                border: `1px solid ${currentModeConfig.primaryColor}55`,
                color: currentModeConfig.primaryColor,
                fontSize: '12px',
                fontWeight: 700,
                fontFamily: 'var(--font-spatial-heading, "Plus Jakarta Sans", sans-serif)',
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: currentModeConfig.primaryColor }} />
              <span>{currentModeConfig.name} Mode</span>
            </div>

            {/* Bluetooth State Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: '9999px',
                background: isConnected ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                color: isConnected ? '#10B981' : 'rgba(255, 255, 255, 0.45)',
                fontSize: '12px',
                fontWeight: 600,
                border: isConnected ? '1px solid rgba(59, 130, 246, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ fontSize: 9 }}>{isConnected ? '●' : '○'}</span>
              <span>{isConnected ? 'ESP32 BLE Online' : 'BLE Standby'}</span>
            </div>
          </div>
        </div>

        {/* ── 5 Choreographed Home Modes Dock ── */}
        <div style={{ marginBottom: 24 }}>
          <SpatialModeDock activeMode={activeMode} onSelectMode={handleSelectMode} />
        </div>

        {/* ── Spatial Bento Grid (Thermostat Rotary Dial & Full-Card Dimmer Lights) ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 16,
            marginBottom: 24,
          }}
        >
          {/* Bento Cell 1: Interactive Rotary Thermostat Dial */}
          <div
            className="glass-card"
            style={{
              borderRadius: '24px',
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.035)',
              backdropFilter: 'blur(28px) saturate(190%)',
              WebkitBackdropFilter: 'blur(28px) saturate(190%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 16px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Thermometer size={16} style={{ color: currentModeConfig.primaryColor }} />
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#FFFFFF', fontFamily: 'var(--font-spatial-heading)' }}>
                  Climate Center
                </h4>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono-numbers)',
                  color: currentModeConfig.primaryColor,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                }}
              >
                HVAC {currentModeConfig.hvacState.toUpperCase()}
              </span>
            </div>

            <RotaryThermostatDial
              temperature={targetTemp}
              onChange={(t) => setTargetTemp(t)}
              hvacState={currentModeConfig.hvacState}
              accentColor={currentModeConfig.primaryColor}
            />
          </div>

          {/* Bento Cell 2: Full-Card Touch Dimmer Lights */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Lightbulb size={16} style={{ color: currentModeConfig.primaryColor }} />
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#FFFFFF', fontFamily: 'var(--font-spatial-heading)' }}>
                  Tactile Light Dimmers
                </h4>
              </div>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>
                Slide to dim · Hold name to delete
              </span>
            </div>

            {lightingDevices.slice(0, 2).map((dev) => {
              const rObj = rooms.find((r) => r.id === dev.roomId);
              return (
                <SpatialDimmerCard
                  key={dev.id}
                  device={dev}
                  roomName={rObj?.name}
                  kelvin={activeMode === 'morning' ? 2700 : activeMode === 'focus' ? 6000 : 3800}
                />
              );
            })}
          </div>
        </div>

        {/* ── Bento Row 2: Floorplan Room Switcher & Live kW Sparkline Telemetry ── */}
        <div style={{ marginBottom: 24 }}>
          <SpatialTelemetryHub
            selectedRoom={selectedRoom}
            onSelectRoom={setSelectedRoom}
            accentColor={currentModeConfig.primaryColor}
          />
        </div>

        {/* ── Quick Actions Row ── */}
        <div className="section-header" style={{ marginBottom: 'var(--space-2)' }}>
          <h3 style={{ fontFamily: 'var(--font-spatial-heading)' }}>Quick Actions</h3>
        </div>
        <div
          className="mobile-quick-actions"
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

          <button
            type="button"
            className="btn btn-secondary"
            style={{ flexShrink: 0, borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap', borderColor: '#3B82F6', color: '#3B82F6' }}
            onClick={() => setAddModalOpen(true)}
          >
            <Plus size={15} /> Add a Device
          </button>

          {/* Master Light Controls */}
          <button
            className="btn btn-secondary"
            style={{ flexShrink: 0, borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap', borderColor: '#3B82F6', color: '#3B82F6' }}
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

        {/* ── 2×2 Dashboard Telemetry Statistics Grid ── */}
        <div
          className="mobile-dashboard-stats"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-5)',
          }}
        >
          <div className="stat-card glass-card">
            <div className="stat-card-icon" style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)' }}>
              <Zap size={20} aria-hidden="true" />
            </div>
            <div className="stat-card-value tabular-numbers">{stats.total}</div>
            <div className="stat-card-label">Configured Devices</div>
          </div>

          <div className="stat-card glass-card">
            <div className="stat-card-icon" style={{ background: 'var(--color-state-on-bg)', color: 'var(--color-state-on)' }}>
              <Lightbulb size={20} aria-hidden="true" />
            </div>
            <div className="stat-card-value tabular-numbers">{stats.onCount}</div>
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
            <div className="stat-card-value tabular-numbers">{stats.upcoming}</div>
            <div className="stat-card-label">Active Schedules</div>
          </div>
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

        {/* ── Device Overview Grid ── */}
        <div className="section-header" style={{ marginBottom: 'var(--space-3)' }}>
          <h3 style={{ fontFamily: 'var(--font-spatial-heading)' }}>
            {selectedRoom === 'all' ? 'All Devices' : `${rooms.find((r) => r.id === selectedRoom)?.name} Devices`}
          </h3>
          <Link to="/devices" className="btn btn-ghost btn-sm" style={{ gap: 'var(--space-1)' }}>
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div
          className="mobile-device-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-5)',
          }}
        >
          {displayedDevices.slice(0, 8).map((d) => (
            <DeviceCard key={d.id} device={d} />
          ))}
        </div>

        {/* ── Upcoming Schedules — Minimal Glass List ── */}
        {schedules.length > 0 && (
          <>
            <div className="section-header" style={{ marginBottom: 'var(--space-3)' }}>
              <h3 style={{ fontFamily: 'var(--font-spatial-heading)' }}>Upcoming Schedules</h3>
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
                      <div style={{ fontWeight: 700, fontSize: 'var(--text-base)', fontFamily: 'var(--font-mono-numbers)', color: 'var(--color-text-primary)', lineHeight: 1 }}>
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

      {/* Add a Device Modal */}
      <DeviceModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        mode="add"
      />
    </div>
  );
}

function getGreeting(now: Date): string {
  const h = now.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
