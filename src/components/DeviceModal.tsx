// ============================================================
// DEVICE MODAL — Add or Edit Home Appliance Devices
// Clean, mobile-friendly dialog with full room & category support
// ============================================================
import React, { useState } from 'react';
import {
  X, Plus, Edit2, Lightbulb, Wind, Thermometer, Tv, Flame, Plug, Zap, Check, AlertCircle,
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import type { Device, DeviceCategory, DeviceSupport } from '../models/types';
import { showToast } from './ToastContainer';

const CATEGORY_OPTIONS: { value: DeviceCategory; label: string; icon: React.ElementType }[] = [
  { value: 'lighting', label: 'Lighting', icon: Lightbulb },
  { value: 'fan', label: 'Fan / Airflow', icon: Wind },
  { value: 'climate', label: 'Climate / AC', icon: Thermometer },
  { value: 'entertainment', label: 'Entertainment / TV', icon: Tv },
  { value: 'water-heating', label: 'Water Heating', icon: Flame },
  { value: 'outlet', label: 'Smart Outlet', icon: Plug },
  { value: 'other', label: 'Other Appliance', icon: Zap },
];

const ICON_OPTIONS = [
  { value: 'Lightbulb', label: 'Light', icon: Lightbulb },
  { value: 'Wind', label: 'Fan', icon: Wind },
  { value: 'Thermometer', label: 'Climate', icon: Thermometer },
  { value: 'Tv', label: 'TV', icon: Tv },
  { value: 'Flame', label: 'Heater', icon: Flame },
  { value: 'Plug', label: 'Plug', icon: Plug },
  { value: 'Zap', label: 'Power', icon: Zap },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  device?: Device;
}

export default function DeviceModal({ isOpen, onClose, mode, device }: Props) {
  const rooms = useAppStore((s) => s.rooms);
  const addDevice = useAppStore((s) => s.addDevice);
  const updateDevice = useAppStore((s) => s.updateDevice);

  const [name, setName] = useState(device?.name ?? '');
  const [roomId, setRoomId] = useState(device?.roomId ?? rooms[0]?.id ?? 'living');
  const [category, setCategory] = useState<DeviceCategory>(device?.category ?? 'lighting');
  const [icon, setIcon] = useState(device?.icon ?? 'Lightbulb');
  const [support, setSupport] = useState<DeviceSupport>(device?.support ?? 'demo');
  const [error, setError] = useState<string | null>(null);

  // Sync state if device prop changes
  React.useEffect(() => {
    if (device && mode === 'edit') {
      setName(device.name);
      setRoomId(device.roomId);
      setCategory(device.category);
      setIcon(device.icon);
      setSupport(device.support);
    } else if (mode === 'add') {
      setName('');
      setRoomId(rooms[0]?.id ?? 'living');
      setCategory('lighting');
      setIcon('Lightbulb');
      setSupport('demo');
    }
    setError(null);
  }, [device, mode, isOpen, rooms]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter an appliance name.');
      return;
    }

    if (mode === 'add') {
      addDevice({
        name: trimmed,
        category,
        roomId,
        icon,
        commandOn: null,
        commandOff: null,
        support,
      });
      const roomObj = rooms.find((r) => r.id === roomId);
      showToast(`Added "${trimmed}" to ${roomObj?.name ?? 'Home'}`, 'success');
    } else if (mode === 'edit' && device) {
      updateDevice(device.id, {
        name: trimmed,
        category,
        roomId,
        icon,
        support,
      });
      showToast(`Updated "${trimmed}"`, 'success');
    }

    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        className="card glass-card"
        style={{
          width: '100%',
          maxWidth: 440,
          borderRadius: 22,
          padding: '24px',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: 'rgba(16,185,129,0.15)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {mode === 'add' ? <Plus size={20} /> : <Edit2 size={18} />}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                {mode === 'add' ? 'Add a Device' : 'Edit Appliance'}
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                {mode === 'add' ? 'Configure a new smart appliance' : 'Modify appliance details & room'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-icon sm"
            aria-label="Close dialog"
            style={{ borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 10,
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              fontSize: '13px',
              marginBottom: 16,
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Appliance Name */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
              Appliance Name *
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Living Room Chandelier, Coffee Maker"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(null); }}
              required
              autoFocus
              style={{ width: '100%' }}
            />
          </div>

          {/* Room Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
              Assigned Room
            </label>
            <select
              className="form-select"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              style={{ width: '100%' }}
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
              Appliance Category
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {CATEGORY_OPTIONS.map((cat) => {
                const CatIcon = cat.icon;
                const isSelected = category === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => {
                      setCategory(cat.value);
                      // Auto-suggest icon based on category
                      if (cat.value === 'lighting') setIcon('Lightbulb');
                      else if (cat.value === 'fan') setIcon('Wind');
                      else if (cat.value === 'climate') setIcon('Thermometer');
                      else if (cat.value === 'entertainment') setIcon('Tv');
                      else if (cat.value === 'water-heating') setIcon('Flame');
                      else if (cat.value === 'outlet') setIcon('Plug');
                      else setIcon('Zap');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 10px',
                      borderRadius: 10,
                      border: isSelected ? '1.5px solid #10b981' : '1px solid var(--color-border)',
                      background: isSelected ? 'rgba(16,185,129,0.12)' : 'var(--color-surface)',
                      color: isSelected ? '#10b981' : 'var(--color-text-primary)',
                      fontSize: '12px',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <CatIcon size={15} style={{ flexShrink: 0 }} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Icon Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
              Display Icon
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {ICON_OPTIONS.map((ico) => {
                const IcoComponent = ico.icon;
                const isSelected = icon === ico.value;
                return (
                  <button
                    key={ico.value}
                    type="button"
                    onClick={() => setIcon(ico.value)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      border: isSelected ? '1.5px solid #10b981' : '1px solid var(--color-border)',
                      background: isSelected ? 'rgba(16,185,129,0.15)' : 'transparent',
                      color: isSelected ? '#10b981' : 'var(--color-text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    title={ico.label}
                  >
                    <IcoComponent size={18} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hardware / Simulation Mode */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
              Operation Mode
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <label
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  borderRadius: 10,
                  border: support === 'demo' ? '1.5px solid #10b981' : '1px solid var(--color-border)',
                  background: support === 'demo' ? 'rgba(16,185,129,0.08)' : 'transparent',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                <input
                  type="radio"
                  name="support"
                  value="demo"
                  checked={support === 'demo'}
                  onChange={() => setSupport('demo')}
                />
                <span>Demo (Simulated)</span>
              </label>
              <label
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  borderRadius: 10,
                  border: support === 'supported' ? '1.5px solid #10b981' : '1px solid var(--color-border)',
                  background: support === 'supported' ? 'rgba(16,185,129,0.08)' : 'transparent',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                <input
                  type="radio"
                  name="support"
                  value="supported"
                  checked={support === 'supported'}
                  onChange={() => setSupport('supported')}
                />
                <span>Hardware (ESP32)</span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              style={{ borderRadius: 'var(--radius-full)', padding: '9px 18px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ borderRadius: 'var(--radius-full)', padding: '9px 22px', gap: 6 }}
            >
              <Check size={16} />
              {mode === 'add' ? 'Add Device' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
