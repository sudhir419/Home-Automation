// ============================================================
// ROTARY THERMOSTAT DIAL — Custom SVG Precision Arc Control
// Interactive pointer drag, animated ticks & temperature interpolation
// Inspired by Nest, Tesla HVAC & Bang & Olufsen rotary hardware
// ============================================================
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Thermometer, Wind, Zap, Flame, Snowflake } from 'lucide-react';

interface Props {
  temperature?: number;
  onChange?: (temp: number) => void;
  hvacState?: 'Cooling' | 'Heating' | 'Eco' | 'Balanced' | 'Turbo';
  accentColor?: string;
}

const MIN_TEMP = 16.0;
const MAX_TEMP = 30.0;
const TOTAL_TICKS = 29; // 14 steps, 0.5 deg each

// Color interpolation from cold cyan (16C) to hot crimson (30C)
function interpolateTempColor(temp: number): string {
  const ratio = Math.max(0, Math.min(1, (temp - MIN_TEMP) / (MAX_TEMP - MIN_TEMP)));
  if (ratio < 0.35) {
    // 16C - 20.9C: Cyan to Sky Blue
    return '#06B6D4';
  } else if (ratio < 0.65) {
    // 21C - 25C: Emerald to Amber
    return '#10B981';
  } else if (ratio < 0.85) {
    // 25.1C - 28C: Warm Amber/Orange
    return '#F59E0B';
  } else {
    // 28.1C - 30C: Crimson Heat
    return '#EF4444';
  }
}

export function RotaryThermostatDial({
  temperature = 21.5,
  onChange,
  hvacState = 'Cooling',
  accentColor,
}: Props) {
  const [currentTemp, setCurrentTemp] = useState(temperature);
  const [isDragging, setIsDragging] = useState(false);
  const dialRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentTemp(temperature);
  }, [temperature]);

  const activeColor = accentColor || interpolateTempColor(currentTemp);

  // SVG Geometry calculations (240 deg arc, gap at bottom)
  const size = 220;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const startAngle = 140; // in degrees
  const endAngle = 400;   // in degrees (260 degree sweep)
  const sweepAngle = endAngle - startAngle;

  const progressRatio = (currentTemp - MIN_TEMP) / (MAX_TEMP - MIN_TEMP);
  const currentAngle = startAngle + progressRatio * sweepAngle;

  // Coordinate helper
  const polarToCartesian = (cx: number, cy: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(angleInRadians),
      y: cy + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, r: number, startA: number, endA: number) => {
    const start = polarToCartesian(x, y, r, endA);
    const end = polarToCartesian(x, y, r, startA);
    const largeArcFlag = endA - startA <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', r, r, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  };

  const bgPath = describeArc(center, center, radius, startAngle, endAngle);
  const activePath = describeArc(center, center, radius, startAngle, currentAngle);
  const knobPos = polarToCartesian(center, center, radius, currentAngle);

  // Handle pointer rotation
  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    if (!dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const dx = clientX - cx;
    const dy = clientY - cy;

    // Angle in degrees from 12 o'clock (0 to 360)
    let deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (deg < 0) deg += 360;

    // Map 0-360 into our startAngle(140) to endAngle(400) space
    let dialDeg = deg;
    if (dialDeg < 100) dialDeg += 360; // wrap around for right-bottom quadrant

    // Clamp into sweep
    let clampedDeg = Math.max(startAngle, Math.min(endAngle, dialDeg));
    const ratio = (clampedDeg - startAngle) / sweepAngle;
    const newTemp = Math.round((MIN_TEMP + ratio * (MAX_TEMP - MIN_TEMP)) * 2) / 2;

    setCurrentTemp(newTemp);
    if (onChange) onChange(newTemp);
  }, [onChange, startAngle, endAngle, sweepAngle]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    handlePointerMove(e.clientX, e.clientY);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      {/* Rotary Dial Container */}
      <div
        ref={dialRef}
        onPointerDown={handlePointerDown}
        onPointerMove={(e) => isDragging && handlePointerMove(e.clientX, e.clientY)}
        onPointerUp={handlePointerUp}
        style={{
          position: 'relative',
          width: size,
          height: size,
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none',
        }}
      >
        <svg width={size} height={size} style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="dialActiveGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="50%" stopColor="#10B981" />
              <stop offset="100%" stopColor={activeColor} />
            </linearGradient>
            <filter id="dialGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor={activeColor} floodOpacity="0.45" />
            </filter>
          </defs>

          {/* Background Track */}
          <path
            d={bgPath}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Tick marks around perimeter */}
          {Array.from({ length: TOTAL_TICKS }).map((_, i) => {
            const tickRatio = i / (TOTAL_TICKS - 1);
            const tickAngle = startAngle + tickRatio * sweepAngle;
            const p1 = polarToCartesian(center, center, radius - 18, tickAngle);
            const p2 = polarToCartesian(center, center, radius - 12, tickAngle);
            const isLit = tickRatio <= progressRatio;

            return (
              <line
                key={`tick-${i}`}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={isLit ? activeColor : 'rgba(255,255,255,0.15)'}
                strokeWidth={i % 2 === 0 ? 2 : 1}
                strokeOpacity={isLit ? 0.9 : 0.4}
              />
            );
          })}

          {/* Active Gradient Arc with Glow */}
          {currentTemp > MIN_TEMP && (
            <path
              d={activePath}
              fill="none"
              stroke="url(#dialActiveGradient)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              filter="url(#dialGlow)"
            />
          )}

          {/* Drag Knob Handle */}
          <circle
            cx={knobPos.x}
            cy={knobPos.y}
            r={11}
            fill="#FFFFFF"
            stroke={activeColor}
            strokeWidth={3}
            style={{
              filter: `drop-shadow(0 0 10px ${activeColor})`,
              transition: isDragging ? 'none' : 'cx 0.15s ease, cy 0.15s ease',
            }}
          />
        </svg>

        {/* Center Digital Readout HUD */}
        <div
          style={{
            position: 'absolute',
            inset: '30px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.06) 0%, rgba(10,12,18,0.92) 80%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: `inset 0 0 24px rgba(0,0,0,0.8), 0 0 30px ${activeColor}15`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          {/* Status Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '10px',
              fontFamily: 'var(--font-mono-numbers, "JetBrains Mono", monospace)',
              fontWeight: 700,
              color: activeColor,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 2,
            }}
          >
            {hvacState === 'Cooling' ? <Snowflake size={11} /> :
             hvacState === 'Heating' ? <Flame size={11} /> :
             <Wind size={11} />}
            <span>{hvacState}</span>
          </div>

          {/* Big Temperature Readout */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              fontFamily: 'var(--font-mono-numbers, "JetBrains Mono", monospace)',
              fontFeatureSettings: '"tnum" 1',
              fontWeight: 800,
              fontSize: '38px',
              color: '#FFFFFF',
              lineHeight: 1,
              letterSpacing: '-0.03em',
            }}
          >
            <span>{currentTemp.toFixed(1)}</span>
            <span style={{ fontSize: '18px', color: activeColor, marginLeft: 2, marginTop: -2 }}>°C</span>
          </div>

          {/* Target Room Label */}
          <div
            style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.45)',
              fontFamily: 'var(--font-spatial-heading, "Plus Jakarta Sans", sans-serif)',
              fontWeight: 500,
              marginTop: 4,
            }}
          >
            Set Point
          </div>
        </div>
      </div>

      {/* Preset Temperature Quick-Chips */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          marginTop: 10,
        }}
      >
        {[18, 20.5, 22, 24, 26].map((temp) => (
          <button
            key={temp}
            type="button"
            onClick={() => {
              setCurrentTemp(temp);
              if (onChange) onChange(temp);
            }}
            style={{
              padding: '4px 10px',
              borderRadius: '9999px',
              border: currentTemp === temp ? `1px solid ${activeColor}` : '1px solid rgba(255,255,255,0.1)',
              background: currentTemp === temp ? `${activeColor}22` : 'rgba(255,255,255,0.03)',
              color: currentTemp === temp ? activeColor : 'rgba(255,255,255,0.6)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono-numbers, "JetBrains Mono", monospace)',
              fontFeatureSettings: '"tnum" 1',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {temp}°
          </button>
        ))}
      </div>
    </div>
  );
}
