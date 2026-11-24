// ============================================================
// NOTIFICATIONS PAGE — Activity feed with filters
// ============================================================
import { useState } from 'react';
import {
  Bell, Bluetooth, Zap, Calendar, Settings, Trash2, Info,
  CheckCircle, AlertTriangle, XCircle, AlertCircle,
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import type { ActivityEvent, ActivityLevel, ActivityCategory } from '../models/types';

type FilterType = 'all' | ActivityCategory;

const FILTERS: { id: FilterType; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'All', icon: Bell },
  { id: 'bluetooth', label: 'Bluetooth', icon: Bluetooth },
  { id: 'device', label: 'Device', icon: Zap },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'system', label: 'System', icon: Settings },
];

function getLevelIcon(level: ActivityLevel): React.ElementType {
  switch (level) {
    case 'success': return CheckCircle;
    case 'warning': return AlertTriangle;
    case 'error': return XCircle;
    default: return AlertCircle;
  }
}

function getLevelColor(level: ActivityLevel): string {
  switch (level) {
    case 'success': return '#3B82F6';
    case 'warning': return '#f59e0b';
    case 'error': return '#ef4444';
    default: return '#3b82f6';
  }
}

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'yesterday';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function NotificationsPage() {
  const activity = useAppStore((s) => s.activity);
  const clearActivity = useAppStore((s) => s.clearActivity);
  const [filter, setFilter] = useState<FilterType>('all');

  const filtered = activity.filter((ev: ActivityEvent) =>
    filter === 'all' ? true : ev.category === filter
  );

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2>Notifications</h2>
            <p>{activity.length} event{activity.length !== 1 ? 's' : ''} recorded</p>
          </div>
          {activity.length > 0 && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={clearActivity}
              style={{ color: '#ef4444', gap: 4 }}
            >
              <Trash2 size={14} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Filter pills */}
      <div style={{
        display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4,
        marginBottom: 16, scrollbarWidth: 'none',
      }}>
        {FILTERS.map((f) => {
          const FIcon = f.icon;
          const isActive = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 12px', borderRadius: 20, border: '1px solid',
                borderColor: isActive ? '#3B82F6' : 'var(--color-border)',
                background: isActive ? 'rgba(59,130,246,0.12)' : 'var(--color-surface)',
                color: isActive ? '#3B82F6' : 'var(--color-text-secondary)',
                fontSize: 13, fontWeight: isActive ? 600 : 400,
                cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                transition: 'all 150ms ease',
              }}
            >
              <FIcon size={13} />
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Events list */}
      {filtered.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 12, padding: '60px 20px', textAlign: 'center',
        }}>
          <Bell size={40} style={{ color: 'var(--color-text-tertiary)', opacity: 0.5 }} />
          <div>
            <div style={{ fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
              No notifications
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)' }}>
              Events from device changes, schedules, and Bluetooth will appear here.
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filtered.map((ev: ActivityEvent) => {
            const LevelIcon = getLevelIcon(ev.level);
            const color = getLevelColor(ev.level);
            return (
              <div
                key={ev.id}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: '12px 14px', borderRadius: 12,
                  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                }}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: `${color}15`, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0, marginTop: 1,
                }}>
                  <LevelIcon size={16} style={{ color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: 500, fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-primary)', marginBottom: 3, lineHeight: 1.4,
                  }}>
                    {ev.title}
                    {ev.detail && (
                      <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400 }}>
                        {' — '}{ev.detail}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                      {formatRelativeTime(ev.timestamp)}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--color-border)' }}>·</span>
                    <span style={{
                      fontSize: 10, fontWeight: 600, letterSpacing: '0.05em',
                      textTransform: 'uppercase', color: 'var(--color-text-tertiary)',
                    }}>
                      {ev.category}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 10,
                      background: `${color}15`, color, textTransform: 'capitalize',
                      letterSpacing: '0.03em',
                    }}>
                      {ev.level}
                    </span>
                    {ev.isHardwareConfirmed && (
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 10,
                        background: 'rgba(59,130,246,0.12)', color: '#3B82F6',
                      }}>
                        HW ✓
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filtered.length > 0 && (
        <div className="alert info" style={{ fontSize: 'var(--text-xs)', marginTop: 20 }}>
          <Info size={13} />
          Activity log is stored locally and cleared on data reset.
        </div>
      )}
    </div>
  );
}
