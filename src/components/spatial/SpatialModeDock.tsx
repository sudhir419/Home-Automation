// ============================================================
// SPATIAL MODE DOCK — Shared-Element layoutId Pill Morphing
// Apple HomeKit & Tesla Automotive Grade Dock
// ============================================================
import React from 'react';
import { motion } from 'framer-motion';
import {
  Sun, Target, Film, Leaf, Flame, Sparkles,
} from 'lucide-react';
import { SpatialModeId, SPATIAL_MODES, SPRING_TRANSITIONS } from '../../styles/modes';

const MODE_ITEMS: { id: SpatialModeId; icon: React.ElementType }[] = [
  { id: 'morning', icon: Sun },
  { id: 'focus', icon: Target },
  { id: 'cinema', icon: Film },
  { id: 'eco', icon: Leaf },
  { id: 'party', icon: Flame },
];

interface Props {
  activeMode: SpatialModeId;
  onSelectMode: (mode: SpatialModeId) => void;
}

export function SpatialModeDock({ activeMode, onSelectMode }: Props) {
  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        position: 'relative',
        zIndex: 20,
      }}
    >
      {/* Floating Glass Dock Pill */}
      <nav
        aria-label="Spatial Home Modes"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '5px',
          borderRadius: '9999px',
          background: 'rgba(18, 20, 26, 0.72)',
          backdropFilter: 'blur(28px) saturate(190%)',
          WebkitBackdropFilter: 'blur(28px) saturate(190%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
          maxWidth: '100%',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        {MODE_ITEMS.map((item) => {
          const config = SPATIAL_MODES[item.id];
          const Icon = item.icon;
          const isActive = activeMode === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectMode(item.id)}
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '8px 16px',
                borderRadius: '9999px',
                border: 'none',
                background: 'transparent',
                color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.65)',
                fontSize: '13px',
                fontWeight: isActive ? 700 : 500,
                fontFamily: 'var(--font-spatial-heading, "Plus Jakarta Sans", sans-serif)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                outline: 'none',
                WebkitTapHighlightColor: 'transparent',
                transition: 'color 0.2s ease',
              }}
            >
              {/* Shared layoutId morphing background pill */}
              {isActive && (
                <motion.div
                  layoutId="active-spatial-mode-pill"
                  transition={SPRING_TRANSITIONS.morphPill}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '9999px',
                    background: `linear-gradient(135deg, ${config.primaryColor}E6 0%, ${config.primaryColor}B3 100%)`,
                    boxShadow: `0 0 20px ${config.accentGlow}, inset 0 1px 1px rgba(255, 255, 255, 0.4)`,
                    zIndex: 0,
                  }}
                />
              )}

              {/* Icon & Label */}
              <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon
                  size={15}
                  style={{
                    color: isActive ? '#FFFFFF' : config.primaryColor,
                    filter: isActive ? 'drop-shadow(0 0 6px rgba(255,255,255,0.7))' : 'none',
                    transition: 'color 0.2s ease',
                  }}
                />
                <span>{config.name}</span>
              </span>
            </button>
          );
        })}
      </nav>

      {/* Dynamic Sub-Headline with Mode Feedback */}
      <motion.div
        key={activeMode}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: '11px',
          fontFamily: 'var(--font-mono-numbers, "JetBrains Mono", monospace)',
          letterSpacing: '0.04em',
          color: 'rgba(255, 255, 255, 0.6)',
          textTransform: 'uppercase',
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: SPATIAL_MODES[activeMode].primaryColor,
            boxShadow: `0 0 8px ${SPATIAL_MODES[activeMode].primaryColor}`,
          }}
        />
        <span>{SPATIAL_MODES[activeMode].ambientVibe}</span>
      </motion.div>
    </div>
  );
}
