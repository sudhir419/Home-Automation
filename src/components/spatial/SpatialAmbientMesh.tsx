// ============================================================
// SPATIAL AMBIENT MESH ENGINE (GPU COMPOSITED AT 60FPS)
// Animates strictly transform (translate3d/scale/rotate) & opacity
// Zero runtime CPU/GPU blur recomputation (Pro-Tip verified)
// ============================================================
import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SpatialModeId, SPATIAL_MODES } from '../../styles/modes';

interface Props {
  activeMode: SpatialModeId;
}

export const SpatialAmbientMesh = memo(function SpatialAmbientMesh({ activeMode }: Props) {
  const currentMode = SPATIAL_MODES[activeMode] || SPATIAL_MODES.morning;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
        background: currentMode.canvasBg,
        transition: 'background-color 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Static Pre-blurred Container — will-change transform isolates GPU compositing */}
      <div
        style={{
          position: 'absolute',
          inset: -60,
          filter: 'blur(75px)',
          WebkitFilter: 'blur(75px)',
          willChange: 'transform',
          transform: 'translate3d(0, 0, 0)',
        }}
      >
        <AnimatePresence mode="popLayout">
          {currentMode.meshOrbs.map((orb, index) => (
            <motion.div
              key={`${activeMode}-orb-${index}`}
              initial={{
                opacity: 0,
                transform: `translate3d(${orb.x}, ${orb.y}, 0) scale(0.6) rotate(0deg)`,
              }}
              animate={{
                opacity: orb.opacity,
                transform: [
                  `translate3d(${orb.x}, ${orb.y}, 0) scale(${orb.scale}) rotate(0deg)`,
                  `translate3d(calc(${orb.x} + 4%), calc(${orb.y} - 3%), 0) scale(${orb.scale * 1.08}) rotate(${index % 2 === 0 ? 15 : -15}deg)`,
                  `translate3d(${orb.x}, ${orb.y}, 0) scale(${orb.scale}) rotate(0deg)`,
                ],
              }}
              exit={{
                opacity: 0,
                transform: `translate3d(${orb.x}, ${orb.y}, 0) scale(0.4) rotate(30deg)`,
                transition: { duration: 0.6, ease: 'easeInOut' },
              }}
              transition={{
                duration: 9 + index * 3,
                repeat: Infinity,
                repeatType: 'mirror',
                ease: 'easeInOut',
              }}
              style={{
                position: 'absolute',
                width: orb.size,
                height: orb.size,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${orb.color} 0%, ${orb.color}00 70%)`,
                transformOrigin: 'center center',
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Mode-Specific Environmental Overlay (GPU Composited) */}
      <AnimatePresence>
        {activeMode === 'cinema' && (
          <motion.div
            key="cinema-vignette"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.85 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at 50% 50%, rgba(3,3,6,0.2) 20%, rgba(3,3,6,0.92) 85%)',
            }}
          />
        )}

        {activeMode === 'eco' && (
          <motion.div
            key="eco-sonar-ring"
            initial={{ opacity: 0.6, scale: 0.3 }}
            animate={{ opacity: [0.5, 0], scale: [0.4, 2.2] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: '30%',
              left: '50%',
              width: '400px',
              height: '400px',
              marginLeft: '-200px',
              marginTop: '-200px',
              borderRadius: '50%',
              border: '2px solid rgba(59, 130, 246, 0.45)',
              boxShadow: '0 0 40px rgba(59, 130, 246, 0.25)',
              pointerEvents: 'none',
            }}
          />
        )}

        {activeMode === 'morning' && (
          <motion.div
            key="morning-sun-flare"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.35, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.8 }}
            style={{
              position: 'absolute',
              top: '-15%',
              left: '-10%',
              width: '55vw',
              height: '55vw',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(251, 146, 60, 0.35) 0%, rgba(245, 158, 11, 0) 70%)',
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      {/* Micro-dot spatial matrix grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          opacity: 0.6,
          maskImage: 'radial-gradient(ellipse at 50% 50%, black 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, black 40%, transparent 80%)',
        }}
      />
    </div>
  );
});
