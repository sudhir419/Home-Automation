// ============================================================
// SPATIAL TELEMETRY HUB & ROOM SWITCHER
// Floorplan Telemetry, Live Power Draw (kW) Sparkline & Security Feed
// Inspired by Tesla Energy & Rivian Center Display Telemetry
// ============================================================
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, ShieldCheck, Lock, Unlock, Camera, Video,
  Zap, Layers, Wifi, TrendingDown,
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { SPRING_TRANSITIONS } from '../../styles/modes';

interface Props {
  selectedRoom: string;
  onSelectRoom: (roomId: string) => void;
  accentColor?: string;
}

export function SpatialTelemetryHub({
  selectedRoom,
  onSelectRoom,
  accentColor = '#10B981',
}: Props) {
  const rooms = useAppStore((s) => s.rooms);
  const devices = useAppStore((s) => s.devices);
  const [doorLocked, setDoorLocked] = useState(true);
  const [livePowerWatts, setLivePowerWatts] = useState(480);

  // Generate live simulated telemetry fluctuations (kW)
  useEffect(() => {
    const timer = setInterval(() => {
      const activeCount = devices.filter((d) => d.confirmedState === 'on').length;
      const base = 250 + activeCount * 65;
      const jitter = Math.sin(Date.now() / 2000) * 45;
      setLivePowerWatts(Math.max(120, Math.round(base + jitter)));
    }, 2500);
    return () => clearInterval(timer);
  }, [devices]);

  const liveKw = (livePowerWatts / 1000).toFixed(2);

  // Telemetry Sparkline Path Points
  const sparkPoints = [22, 28, 25, 34, 40, 36, 45, 42, 58, 52, 60, 54, 48, 62, 59];
  const maxVal = Math.max(...sparkPoints);
  const minVal = Math.min(...sparkPoints);
  const width = 240;
  const height = 48;
  const pathD = sparkPoints
    .map((val, idx) => {
      const x = (idx / (sparkPoints.length - 1)) * width;
      const y = height - ((val - minVal) / (maxVal - minVal || 1)) * (height - 12) - 6;
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        width: '100%',
      }}
    >
      {/* ── Floorplan Room Switcher Tabs with layoutId ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          paddingBottom: 2,
        }}
      >
        <button
          type="button"
          onClick={() => onSelectRoom('all')}
          style={{
            position: 'relative',
            padding: '7px 14px',
            borderRadius: '9999px',
            border: 'none',
            background: 'transparent',
            color: selectedRoom === 'all' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.55)',
            fontSize: '12px',
            fontFamily: 'var(--font-spatial-heading, "Plus Jakarta Sans", sans-serif)',
            fontWeight: selectedRoom === 'all' ? 700 : 500,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            outline: 'none',
          }}
        >
          {selectedRoom === 'all' && (
            <motion.div
              layoutId="active-room-tab-pill"
              transition={SPRING_TRANSITIONS.morphPill}
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: `1px solid ${accentColor}88`,
                boxShadow: `0 0 16px ${accentColor}33`,
                zIndex: 0,
              }}
            />
          )}
          <span style={{ position: 'relative', zIndex: 1 }}>All Zones</span>
        </button>

        {rooms.map((r) => {
          const isSelected = selectedRoom === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onSelectRoom(r.id)}
              style={{
                position: 'relative',
                padding: '7px 14px',
                borderRadius: '9999px',
                border: 'none',
                background: 'transparent',
                color: isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.55)',
                fontSize: '12px',
                fontFamily: 'var(--font-spatial-heading, "Plus Jakarta Sans", sans-serif)',
                fontWeight: isSelected ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                outline: 'none',
              }}
            >
              {isSelected && (
                <motion.div
                  layoutId="active-room-tab-pill"
                  transition={SPRING_TRANSITIONS.morphPill}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '9999px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: `1px solid ${accentColor}88`,
                    boxShadow: `0 0 16px ${accentColor}33`,
                    zIndex: 0,
                  }}
                />
              )}
              <span style={{ position: 'relative', zIndex: 1 }}>{r.name}</span>
            </button>
          );
        })}
      </div>

      {/* ── Spatial Telemetry Cards (Power Demand & Security) ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 12,
        }}
      >
        {/* Real-Time Power Draw Card */}
        <div
          className="card"
          style={{
            padding: '16px 18px',
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.035)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: `${accentColor}22`,
                  color: accentColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Zap size={16} />
              </div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
                Live Load Telemetry
              </span>
            </div>
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono-numbers, "JetBrains Mono", monospace)',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                gap: 3,
              }}
            >
              <TrendingDown size={13} /> -12% avg
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, margin: '8px 0' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono-numbers, "JetBrains Mono", monospace)',
                fontFeatureSettings: '"tnum" 1',
                fontSize: '32px',
                fontWeight: 800,
                color: '#FFFFFF',
                lineHeight: 1,
              }}
            >
              {liveKw}
            </span>
            <span style={{ fontSize: '14px', color: accentColor, fontWeight: 700 }}>kW</span>
            <span
              style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.45)',
                fontFamily: 'var(--font-mono-numbers, "JetBrains Mono", monospace)',
                marginLeft: 8,
              }}
            >
              ({livePowerWatts} W)
            </span>
          </div>

          {/* SVG Sparkline */}
          <div style={{ width: '100%', height: height, marginTop: 4, position: 'relative' }}>
            <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="powerSparkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={accentColor} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={pathD} fill="none" stroke={accentColor} strokeWidth={2.5} strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Security & Access Perimeter Telemetry Card */}
        <div
          className="card"
          style={{
            padding: '16px 18px',
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.035)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: '#38BDF8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldCheck size={16} />
              </div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
                Perimeter Telemetry
              </span>
            </div>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '9999px',
                background: 'rgba(16, 185, 129, 0.16)',
                color: '#10B981',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Armed
            </span>
          </div>

          {/* Interactive Lock State Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '14px 0 6px 0' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>
                Main Residence Gate
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>
                Ultra-Wideband Smart Key
              </div>
            </div>

            <button
              type="button"
              onClick={() => setDoorLocked(!doorLocked)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                borderRadius: '9999px',
                border: doorLocked ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                background: doorLocked ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                color: doorLocked ? '#10B981' : '#EF4444',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {doorLocked ? <Lock size={13} /> : <Unlock size={13} />}
              <span>{doorLocked ? 'LOCKED' : 'UNLOCKED'}</span>
            </button>
          </div>

          {/* 4K Security Camera Feed Strip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 10px',
              borderRadius: '10px',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255,255,255,0.06)',
              fontSize: '11px',
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Video size={13} style={{ color: '#EF4444' }} />
              <span>North Lawn Cam · <strong style={{ color: '#FFFFFF' }}>Live</strong></span>
            </span>
            <span style={{ color: '#EF4444', fontWeight: 700, fontSize: '10px', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444' }} />
              REC 4K
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
