// ============================================================
// ENTERTAINMENT PAGE
// ============================================================
import { Tv, Flame, Info, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import DeviceCard from '../components/DeviceCard';

export default function EntertainmentPage() {
  const devices = useAppStore((s) => s.devices);
  const tvs = devices.filter((d) => d.category === 'entertainment');
  const geysers = devices.filter((d) => d.category === 'water-heating');
  const outlets = devices.filter((d) => d.category === 'outlet');

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div style={{ width: 44, height: 44, background: 'var(--color-highlight-light)', color: 'var(--color-highlight)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Tv size={22} />
          </div>
          <div>
            <h2>Entertainment</h2>
            <p>TVs, media devices &amp; other appliances</p>
          </div>
        </div>
      </div>

      <div className="alert info mb-6">
        <Info size={16} />
        TV control requires an IR blaster or HDMI-CEC interface. Standard Bluetooth cannot directly power-cycle a TV.
        These are shown for planning purposes only.
      </div>

      <div className="section-header"><h3>TVs &amp; Media</h3></div>
      <div className="grid-auto mb-6">
        {tvs.map((d) => <DeviceCard key={d.id} device={d} />)}
      </div>

      {/* Geysers */}
      {geysers.length > 0 && (
        <>
          <div className="section-header">
            <h3 className="flex items-center gap-2"><Flame size={18} /> Water Heating</h3>
          </div>
          <div className="alert error mb-4">
            <AlertTriangle size={16} />
            <span>
              <strong>Safety Warning:</strong> Geysers operate on 230V mains. Control requires appropriately rated,
              enclosed switching hardware installed by a qualified electrician under teacher supervision.
              Do NOT connect directly to ESP32 GPIO.
            </span>
          </div>
          <div className="grid-auto mb-6">
            {geysers.map((d) => <DeviceCard key={d.id} device={d} />)}
          </div>
        </>
      )}

      {/* Outlets */}
      {outlets.length > 0 && (
        <>
          <div className="section-header"><h3>Smart Outlets</h3></div>
          <div className="grid-auto">
            {outlets.map((d) => <DeviceCard key={d.id} device={d} />)}
          </div>
        </>
      )}
    </div>
  );
}
