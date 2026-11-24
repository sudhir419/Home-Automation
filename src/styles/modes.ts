// ============================================================
// SPATIAL HOME MODES — Design Tokens & GPU-Composited Transitions
// Inspired by Apple HomeKit, Rivian/Tesla Automotive UI & B&O
// ============================================================

export type SpatialModeId = 'morning' | 'focus' | 'cinema' | 'eco' | 'party';

export interface SpatialModeConfig {
  id: SpatialModeId;
  name: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  accentGlow: string;
  badgeBg: string;
  canvasBg: string;
  meshOrbs: {
    x: string;
    y: string;
    size: string;
    color: string;
    opacity: number;
    scale: number;
  }[];
  temperature: number;
  hvacState: 'Cooling' | 'Heating' | 'Eco' | 'Balanced' | 'Turbo';
  targetDeviceStates: Record<string, 'on' | 'off' | 'dim'>;
  description: string;
  ambientVibe: string;
}

export const SPATIAL_MODES: Record<SpatialModeId, SpatialModeConfig> = {
  morning: {
    id: 'morning',
    name: 'Morning',
    tagline: 'Sunrise Bloom',
    primaryColor: '#F59E0B',
    secondaryColor: '#FDBA74',
    accentGlow: 'rgba(245, 158, 11, 0.42)',
    badgeBg: 'rgba(245, 158, 11, 0.16)',
    canvasBg: '#09080A',
    meshOrbs: [
      { x: '-15%', y: '-10%', size: '650px', color: '#F59E0B', opacity: 0.28, scale: 1.15 },
      { x: '70%', y: '40%', size: '520px', color: '#FB923C', opacity: 0.16, scale: 0.95 },
      { x: '20%', y: '80%', size: '400px', color: '#FDE047', opacity: 0.12, scale: 0.8 },
    ],
    temperature: 22.5,
    hvacState: 'Heating',
    targetDeviceStates: {
      'light-1': 'on',
      'light-2': 'on',
      'fan-living': 'off',
      'ac-bedroom': 'off',
    },
    description: 'Golden dawn ambient glow, smart motorized blinds open, soft daylight cascades.',
    ambientVibe: 'Warm Amber Sunrise · 22.5°C · Daylight Bloom',
  },
  focus: {
    id: 'focus',
    name: 'Focus',
    tagline: 'Precision Snap',
    primaryColor: '#06B6D4',
    secondaryColor: '#38BDF8',
    accentGlow: 'rgba(6, 182, 212, 0.38)',
    badgeBg: 'rgba(6, 182, 212, 0.16)',
    canvasBg: '#06080B',
    meshOrbs: [
      { x: '10%', y: '-5%', size: '580px', color: '#06B6D4', opacity: 0.22, scale: 1.05 },
      { x: '80%', y: '60%', size: '480px', color: '#0284C7', opacity: 0.18, scale: 1.0 },
      { x: '-10%', y: '70%', size: '420px', color: '#0EA5E9', opacity: 0.12, scale: 0.85 },
    ],
    temperature: 20.0,
    hvacState: 'Cooling',
    targetDeviceStates: {
      'light-1': 'on',
      'light-2': 'dim',
      'tv-living': 'off',
      'fan-living': 'on',
    },
    description: 'Electric cyan clean spotlight, zero-distraction entertainment mute, air purifier max.',
    ambientVibe: 'Precision Cyan · 20.0°C · High Concentration Airflow',
  },
  cinema: {
    id: 'cinema',
    name: 'Cinema',
    tagline: 'Theater Dimming',
    primaryColor: '#8B5CF6',
    secondaryColor: '#F43F5E',
    accentGlow: 'rgba(139, 92, 246, 0.44)',
    badgeBg: 'rgba(139, 92, 246, 0.18)',
    canvasBg: '#030306',
    meshOrbs: [
      { x: '45%', y: '10%', size: '640px', color: '#7C3AED', opacity: 0.24, scale: 1.1 },
      { x: '85%', y: '75%', size: '540px', color: '#F43F5E', opacity: 0.20, scale: 0.9 },
      { x: '-10%', y: '40%', size: '460px', color: '#4C1D95', opacity: 0.18, scale: 0.85 },
    ],
    temperature: 21.0,
    hvacState: 'Balanced',
    targetDeviceStates: {
      'light-1': 'off',
      'light-2': 'off',
      'tv-living': 'on',
      'fan-bedroom': 'on',
    },
    description: 'Obsidian vignette sweeps in, ceiling spots fade down, OLED surround sound activates.',
    ambientVibe: 'Deep Violet Noir · 21.0°C · Dolby Spatial Active',
  },
  eco: {
    id: 'eco',
    name: 'Eco / Away',
    tagline: 'Pulse Wave',
    primaryColor: '#10B981',
    secondaryColor: '#34D399',
    accentGlow: 'rgba(16, 185, 129, 0.38)',
    badgeBg: 'rgba(16, 185, 129, 0.16)',
    canvasBg: '#050A07',
    meshOrbs: [
      { x: '50%', y: '30%', size: '620px', color: '#2563EB', opacity: 0.22, scale: 1.0 },
      { x: '-5%', y: '80%', size: '480px', color: '#10B981', opacity: 0.18, scale: 0.9 },
      { x: '75%', y: '-10%', size: '440px', color: '#34D399', opacity: 0.12, scale: 0.8 },
    ],
    temperature: 24.5,
    hvacState: 'Eco',
    targetDeviceStates: {
      'light-1': 'off',
      'light-2': 'off',
      'tv-living': 'off',
      'fan-living': 'off',
      'ac-bedroom': 'off',
    },
    description: 'Radar security pulse armed, parasitic loads standby, battery storage optimal.',
    ambientVibe: 'Emerald Radar Guard · 24.5°C · 0.14 kW Standby Load',
  },
  party: {
    id: 'party',
    name: 'Party',
    tagline: 'Aurora Mesh',
    primaryColor: '#EC4899',
    secondaryColor: '#6366F1',
    accentGlow: 'rgba(236, 72, 153, 0.45)',
    badgeBg: 'rgba(236, 72, 153, 0.2)',
    canvasBg: '#08050C',
    meshOrbs: [
      { x: '25%', y: '15%', size: '600px', color: '#EC4899', opacity: 0.32, scale: 1.2 },
      { x: '80%', y: '35%', size: '560px', color: '#6366F1', opacity: 0.28, scale: 1.05 },
      { x: '10%', y: '75%', size: '520px', color: '#A855F7', opacity: 0.25, scale: 0.95 },
    ],
    temperature: 19.5,
    hvacState: 'Turbo',
    targetDeviceStates: {
      'light-1': 'on',
      'light-2': 'on',
      'tv-living': 'on',
      'fan-living': 'on',
    },
    description: 'Drifting neon aurora meshes, 120BPM beat visualizer, dynamic multi-zone illumination.',
    ambientVibe: 'Magenta Aurora Rave · 19.5°C · Live Beat Sync Active',
  },
};

// Physics spring transitions for Framer Motion
export const SPRING_TRANSITIONS = {
  crisp: {
    type: 'spring',
    stiffness: 420,
    damping: 32,
    mass: 0.8,
  },
  smooth: {
    type: 'spring',
    stiffness: 260,
    damping: 26,
    mass: 1.0,
  },
  bouncy: {
    type: 'spring',
    stiffness: 340,
    damping: 20,
    mass: 0.9,
  },
  morphPill: {
    type: 'spring',
    stiffness: 500,
    damping: 38,
  },
} as const;
