// ============================================================
// SPATIAL FULL-CARD TOUCH DIMMER LIGHT
// Tactile horizontal fill slider with luminous Kelvin/RGB glow
// Inspired by Bang & Olufsen Touch-to-Slide hardware & Apple Home
// ============================================================
import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Power, SunMedium, Flame, Sparkles } from 'lucide-react';
import type { Device } from '../../models/types';
import { useBluetooth } from '../../services/bluetooth/useBluetooth';
import { useAppStore } from '../../store/appStore';
import { showToast } from '../ToastContainer';
import DeviceModal from '../DeviceModal';

interface Props {
  device: Device;
  roomName?: string;
  initialBrightness?: number;
  kelvin?: number; // 2700 (warm) to 6500 (cool daylight)
}

function kelvinToRgb(k: number) {
  // Approximate Kelvin color temperature to warm/cool glow
  if (k <= 3000) return { hex: '#F59E0B', glow: 'rgba(245, 158, 11, 0.45)', label: 'Warm Amber 2700K' };
  if (k <= 4500) return { hex: '#FDE047', glow: 'rgba(253, 224, 71, 0.38)', label: 'Neutral Warm 3800K' };
  return { hex: '#38BDF8', glow: 'rgba(56, 189, 248, 0.38)', label: 'Daylight Crisp 6000K' };
}

export function SpatialDimmerCard({
  device,
  roomName,
  initialBrightness = 75,
  kelvin = 2700,
}: Props) {
  const [brightness, setBrightness] = useState(device.confirmedState === 'on' ? initialBrightness : 0);
  const [isDragging, setIsDragging] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const { sendDeviceCommand } = useBluetooth();
  const setDeviceState = useAppStore((s) => s.setDeviceState);
  const removeDevice = useAppStore((s) => s.removeDevice);
  const preferences = useAppStore((s) => s.preferences);

  const isOn = brightness > 0 && device.confirmedState === 'on';
  const colorSpec = kelvinToRgb(kelvin);

  // Drag interaction to adjust brightness %
  const updateBrightnessFromPointer = useCallback((clientX: number) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    const newPercent = Math.round(ratio * 100);

    setBrightness(newPercent);
    if (newPercent > 0 && device.confirmedState !== 'on') {
      setDeviceState(device.id, 'on');
      sendDeviceCommand(device.id, 'on', preferences.demoMode);
    } else if (newPercent === 0 && device.confirmedState === 'on') {
      setDeviceState(device.id, 'off');
      sendDeviceCommand(device.id, 'off', preferences.demoMode);
    }
  }, [device, preferences.demoMode, sendDeviceCommand, setDeviceState]);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only drag when clicking inside the slider body, not on edit/power buttons
    setIsDragging(true);
    updateBrightnessFromPointer(e.clientX);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    updateBrightnessFromPointer(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  const togglePower = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOn) {
      setBrightness(0);
      setDeviceState(device.id, 'off');
      sendDeviceCommand(device.id, 'off', preferences.demoMode);
    } else {
      const restore = brightness > 0 ? brightness : 80;
      setBrightness(restore);
      setDeviceState(device.id, 'on');
      sendDeviceCommand(device.id, 'on', preferences.demoMode);
    }
  };

  // Long press on appliance name: strictly triggers delete option
  const handlePointerDownName = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    setIsLongPressing(true);
    longPressTimerRef.current = setTimeout(() => {
      setIsLongPressing(false);
      setDeleteConfirmOpen(true);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(60); } catch (_) {}
      }
    }, 550);
  };

  const handlePointerUpName = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setIsLongPressing(false);
  };

  return (
    <>
      <div
        ref={cardRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          position: 'relative',
          borderRadius: '20px',
          padding: '18px 20px',
          background: 'rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: isOn
            ? `0 14px 40px rgba(0,0,0,0.4), 0 0 24px ${colorSpec.glow}`
            : '0 8px 32px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          cursor: isDragging ? 'ew-resize' : 'pointer',
          userSelect: 'none',
          touchAction: 'none',
          transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
        }}
      >
        {/* Full-Card Luminous Horizontal Fill Layer */}
        <motion.div
          animate={{ width: `${isOn ? brightness : 0}%` }}
          transition={{ ease: 'easeOut', duration: isDragging ? 0.02 : 0.25 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            background: `linear-gradient(90deg, ${colorSpec.hex}22 0%, ${colorSpec.hex}55 100%)`,
            borderRight: `2px solid ${colorSpec.hex}`,
            boxShadow: `0 0 28px ${colorSpec.hex}66`,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* Ambient Radial Sheen on Cursor Drag */}
        {isOn && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(circle at ${brightness}% 50%, ${colorSpec.hex}25 0%, transparent 60%)`,
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
        )}

        {/* Card Content Row */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Top Row: Icon + Name + Percentage Readout */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              {/* Quick Icon Power Toggle */}
              <button
                type="button"
                onClick={togglePower}
                title="Toggle power"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  background: isOn ? `${colorSpec.hex}33` : 'rgba(255, 255, 255, 0.06)',
                  border: isOn ? `1px solid ${colorSpec.hex}88` : '1px solid rgba(255, 255, 255, 0.08)',
                  color: isOn ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                  boxShadow: isOn ? `0 0 16px ${colorSpec.hex}66` : 'none',
                }}
              >
                <Lightbulb size={20} style={{ color: isOn ? colorSpec.hex : 'currentColor' }} />
              </button>

              {/* Appliance Name (Long-press to delete) */}
              <div
                style={{
                  minWidth: 0,
                  cursor: 'pointer',
                  padding: '2px 4px',
                  borderRadius: 6,
                  background: isLongPressing ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                  transition: 'background 0.2s',
                }}
                onPointerDown={handlePointerDownName}
                onPointerUp={handlePointerUpName}
                onPointerLeave={handlePointerUpName}
                onPointerCancel={handlePointerUpName}
                title="Press & hold on appliance name to delete"
              >
                <h4
                  style={{
                    margin: 0,
                    fontSize: '15px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-spatial-heading, "Plus Jakarta Sans", sans-serif)',
                    color: '#FFFFFF',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {device.name}
                </h4>
                {roomName && (
                  <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255, 255, 255, 0.45)' }}>
                    {roomName}
                  </p>
                )}
              </div>
            </div>

            {/* Brightness Tabular Numeric Readout */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono-numbers, "JetBrains Mono", monospace)',
                  fontFeatureSettings: '"tnum" 1',
                  fontWeight: 800,
                  fontSize: '18px',
                  color: isOn ? '#FFFFFF' : 'rgba(255, 255, 255, 0.35)',
                  letterSpacing: '-0.02em',
                }}
              >
                {isOn ? `${brightness}%` : 'OFF'}
              </span>
            </div>
          </div>

          {/* Bottom Bar: Touch slider instructions & Kelvin tint */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.45)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <SunMedium size={12} style={{ color: isOn ? colorSpec.hex : 'currentColor' }} />
              <span>Slide horizontally to dim</span>
            </span>
            <span style={{ fontFamily: 'var(--font-mono-numbers, "JetBrains Mono", monospace)' }}>
              {colorSpec.label}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Device Modal */}
      {editOpen && (
        <DeviceModal
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          mode="edit"
          device={device}
        />
      )}

      {/* Delete Confirmation Modal — Strictly on long-press */}
      {deleteConfirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={(e) => {
            e.stopPropagation();
            setDeleteConfirmOpen(false);
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: 380,
              borderRadius: 22,
              padding: '24px',
              background: '#0D0E14',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#FFFFFF', marginBottom: 8 }}>
              Delete Appliance
            </h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, marginBottom: 20 }}>
              Are you sure you want to remove <strong>"{device.name}"</strong>? This will permanently delete it from your smart home panel.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDeleteConfirmOpen(false)}
                style={{ borderRadius: '9999px', padding: '8px 18px', fontSize: 13 }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  removeDevice(device.id);
                  showToast(`Deleted appliance "${device.name}"`, 'info');
                  setDeleteConfirmOpen(false);
                }}
                style={{
                  borderRadius: '9999px',
                  padding: '8px 20px',
                  fontSize: 13,
                  background: '#EF4444',
                  borderColor: '#EF4444',
                  color: '#FFFFFF',
                }}
              >
                Delete Appliance
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
