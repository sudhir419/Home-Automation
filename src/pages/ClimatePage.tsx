// ============================================================
// CLIMATE PAGE
// ============================================================
import { Thermometer, Wind, Info, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import DeviceCard from '../components/DeviceCard';

export default function ClimatePage() {
  const devices = useAppStore((s) => s.devices);
  const acDevices = devices.filter((d) => d.category === 'climate');
  const fans = devices.filter((d) => d.category === 'fan');

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div style={{ width: 44, height: 44, background: 'var(--color-info-bg)', color: 'var(--color-on-info)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Thermometer size={22} />
          </div>
          <div>
            <h2>Climate</h2>
            <p>Air conditioning, fans &amp; temperature control</p>
          </div>
        </div>
      </div>

      {/* Temperature placeholder */}
      <div className="card mb-6" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
        <div style={{ fontSize: '3rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1 }}>
          —
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>Room Temperature</div>
          <div className="alert info" style={{ marginTop: 'var(--space-2)', padding: 'var(--space-2) var(--space-3)' }}>
            <Info size={13} /> No temperature sensor connected
          </div>
        </div>
      </div>

      <div className="alert warning mb-6">
        <AlertTriangle size={16} />
        <span>
          <strong>Note:</strong> AC control requires a compatible IR blaster or relay interface on the ESP32.
          Fan control requires an appropriate motor driver circuit. These are marked Demo Only until hardware is confirmed.
        </span>
      </div>

      {/* AC */}
      <div className="section-header">
        <h3 className="flex items-center gap-2">
          <Thermometer size={18} /> Air Conditioning
        </h3>
      </div>
      <div className="grid-auto mb-6">
        {acDevices.map((d) => <DeviceCard key={d.id} device={d} />)}
      </div>

      {/* Fans */}
      <div className="section-header">
        <h3 className="flex items-center gap-2">
          <Wind size={18} /> Ceiling Fans
        </h3>
      </div>
      <div className="grid-auto">
        {fans.map((d) => <DeviceCard key={d.id} device={d} />)}
      </div>
    </div>
  );
}
