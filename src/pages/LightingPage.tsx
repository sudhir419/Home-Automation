// ============================================================
// LIGHTING PAGE
// ============================================================
import { Lightbulb, Info } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import DeviceCard from '../components/DeviceCard';

export default function LightingPage() {
  const devices = useAppStore((s) => s.devices);
  const lights = devices.filter((d) => d.category === 'lighting');
  const supported = lights.filter((d) => d.support === 'supported');
  const others = lights.filter((d) => d.support !== 'supported');

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div style={{ width: 44, height: 44, background: 'var(--color-accent-light)', color: 'var(--color-accent)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lightbulb size={22} />
          </div>
          <div>
            <h2>Lighting</h2>
            <p>{lights.length} lights · {supported.length} hardware-supported</p>
          </div>
        </div>
      </div>

      {supported.length > 0 && (
        <>
          <div className="section-divider">
            <div className="section-divider-line" />
            <span className="section-divider-label">Hardware-Connected</span>
            <div className="section-divider-line" />
          </div>
          <div className="alert success mb-6">
            <Info size={16} />
            These lights map to real ESP32 GPIO outputs (L1, L2). Toggle them to send confirmed commands.
          </div>
          <div className="grid-auto mb-6">
            {supported.map((d) => <DeviceCard key={d.id} device={d} />)}
          </div>
        </>
      )}

      <div className="section-divider">
        <div className="section-divider-line" />
        <span className="section-divider-label">Unconfigured / Demo</span>
        <div className="section-divider-line" />
      </div>
      <div className="alert info mb-6">
        <Info size={16} />
        These lights have no hardware output mapped yet. They display as unconfigured until the ESP32 firmware supports them.
      </div>
      <div className="grid-auto">
        {others.map((d) => <DeviceCard key={d.id} device={d} />)}
      </div>
    </div>
  );
}
