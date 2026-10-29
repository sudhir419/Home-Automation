// ============================================================
// ROOMS PAGE
// ============================================================
import { useState } from 'react';
import {
  Sofa, BedDouble, UtensilsCrossed, Bath, BookOpen, TreePine,
  Layers, ChevronRight, Lightbulb, Wind, Zap,
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import DeviceCard from '../components/DeviceCard';
import type { Room } from '../models/types';

const ROOM_ICONS: Record<string, React.ElementType> = {
  Sofa, BedDouble, UtensilsCrossed, Bath, BookOpen, TreePine, Layers,
};

export default function RoomsPage() {
  const rooms = useAppStore((s) => s.rooms);
  const devices = useAppStore((s) => s.devices);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  const selected = rooms.find((r) => r.id === selectedRoom);
  const roomDevices = selected
    ? devices.filter((d) => selected.deviceIds.includes(d.id))
    : [];

  return (
    <div>
      <div className="page-header">
        <h2>Rooms</h2>
        <p>Browse devices by room</p>
      </div>

      {!selectedRoom ? (
        <div className="grid-3">
          {rooms.map((room) => {
            const roomDevs = devices.filter((d) => room.deviceIds.includes(d.id));
            const onCount = roomDevs.filter((d) => d.confirmedState === 'on').length;
            const Icon = ROOM_ICONS[room.icon] ?? Layers;
            return (
              <button
                key={room.id}
                className="room-card"
                onClick={() => setSelectedRoom(room.id)}
                aria-label={`View ${room.name} — ${roomDevs.length} devices`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div
                    style={{
                      width: 44, height: 44, borderRadius: 'var(--radius-lg)',
                      background: 'var(--color-accent-light)', color: 'var(--color-accent)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Icon size={22} aria-hidden="true" />
                  </div>
                  <ChevronRight size={18} style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }} />
                </div>

                <div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
                    {room.name}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginTop: 2 }}>
                    {roomDevs.length} device{roomDevs.length !== 1 ? 's' : ''}
                    {onCount > 0 && ` · ${onCount} ON`}
                  </div>
                </div>

                {/* Device type summary */}
                <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                  {roomDevs.filter((d) => d.category === 'lighting').length > 0 && (
                    <span className="chip">
                      <Lightbulb size={10} />
                      {roomDevs.filter((d) => d.category === 'lighting').length}
                    </span>
                  )}
                  {roomDevs.filter((d) => d.category === 'fan').length > 0 && (
                    <span className="chip">
                      <Wind size={10} />
                      {roomDevs.filter((d) => d.category === 'fan').length}
                    </span>
                  )}
                  {roomDevs.filter((d) => !['lighting', 'fan'].includes(d.category)).length > 0 && (
                    <span className="chip">
                      <Zap size={10} />
                      {roomDevs.filter((d) => !['lighting', 'fan'].includes(d.category)).length}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setSelectedRoom(null)}
              aria-label="Back to rooms list"
            >
              ← All Rooms
            </button>
            {selected && (
              <h3 style={{ margin: 0 }}>
                {selected.name}
                <span style={{ fontWeight: 400, color: 'var(--color-text-tertiary)', marginLeft: 8, fontSize: 'var(--text-base)' }}>
                  {roomDevices.length} devices
                </span>
              </h3>
            )}
          </div>

          {roomDevices.length > 0 ? (
            <div className="grid-auto">
              {roomDevices.map((d) => (
                <DeviceCard key={d.id} device={d} showRoom={false} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Zap size={40} />
              <p>No devices in this room yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
