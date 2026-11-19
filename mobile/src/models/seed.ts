// ============================================================
// SEED DATA — Default devices, rooms, scenes, and demo schedules
// Ported from web app with native enhancements
// ============================================================
import type { Device, Room, Schedule, Scene, Automation } from './types';

export const DEFAULT_ROOMS: Room[] = [
  { id: 'living', name: 'Living Room', icon: 'sofa', deviceIds: ['light-living', 'fan-living', 'tv-living', 'light-1', 'fan-ceiling-1', 'ac-living'], sortOrder: 0, ambientTemp: 26.2, humidity: 58 },
  { id: 'bedroom', name: 'Bedroom', icon: 'bed-double', deviceIds: ['light-bedroom', 'fan-bedroom', 'ac-bedroom', 'light-2', 'tv-bedroom'], sortOrder: 1, ambientTemp: 24.8, humidity: 52 },
  { id: 'kitchen', name: 'Kitchen', icon: 'cooking-pot', deviceIds: ['light-kitchen'], sortOrder: 2, ambientTemp: 28.1, humidity: 62 },
  { id: 'bathroom', name: 'Bathroom', icon: 'bath', deviceIds: ['geyser-1', 'geyser-2'], sortOrder: 3, ambientTemp: 27.5, humidity: 70 },
  { id: 'study', name: 'Study Room', icon: 'book-open', deviceIds: ['light-study', 'outlet-study'], sortOrder: 4, ambientTemp: 25.3, humidity: 50 },
  { id: 'outdoor', name: 'Outdoor', icon: 'tree-pine', deviceIds: ['light-outdoor'], sortOrder: 5, ambientTemp: 32.0, humidity: 45 },
];

const now = new Date().toISOString();

export const DEFAULT_DEVICES: Device[] = [
  // --- Lighting (L1, L2 = real HW) ---
  {
    id: 'light-1', name: 'Light 1', category: 'lighting', roomId: 'living',
    icon: 'lightbulb', commandOn: 'L1_ON', commandOff: 'L1_OFF',
    support: 'supported', confirmedState: 'off', pendingState: null,
    errorMessage: null, scheduleIds: [], addedAt: now,
    brightness: 100, colorTemp: 4000, protocol: 'ble', isFavorite: true, sortOrder: 0,
  },
  {
    id: 'light-2', name: 'Light 2', category: 'lighting', roomId: 'bedroom',
    icon: 'lightbulb', commandOn: 'L2_ON', commandOff: 'L2_OFF',
    support: 'supported', confirmedState: 'off', pendingState: null,
    errorMessage: null, scheduleIds: [], addedAt: now,
    brightness: 100, colorTemp: 3200, protocol: 'ble', isFavorite: true, sortOrder: 1,
  },
  {
    id: 'light-living', name: 'Living Room Light', category: 'lighting', roomId: 'living',
    icon: 'lightbulb', commandOn: null, commandOff: null,
    support: 'unconfigured', confirmedState: 'unknown', pendingState: null,
    errorMessage: null, scheduleIds: [], addedAt: now,
    brightness: 80, colorTemp: 4000, sortOrder: 2,
  },
  {
    id: 'light-bedroom', name: 'Bedroom Light', category: 'lighting', roomId: 'bedroom',
    icon: 'lightbulb', commandOn: null, commandOff: null,
    support: 'unconfigured', confirmedState: 'unknown', pendingState: null,
    errorMessage: null, scheduleIds: [], addedAt: now,
    brightness: 60, colorTemp: 2700, sortOrder: 3,
  },
  {
    id: 'light-kitchen', name: 'Kitchen Light', category: 'lighting', roomId: 'kitchen',
    icon: 'lightbulb', commandOn: null, commandOff: null,
    support: 'unconfigured', confirmedState: 'unknown', pendingState: null,
    errorMessage: null, scheduleIds: [], addedAt: now,
    brightness: 100, colorTemp: 5000, sortOrder: 4,
  },
  {
    id: 'light-outdoor', name: 'Outdoor Light', category: 'lighting', roomId: 'outdoor',
    icon: 'lightbulb', commandOn: null, commandOff: null,
    support: 'unconfigured', confirmedState: 'unknown', pendingState: null,
    errorMessage: null, scheduleIds: [], addedAt: now,
    brightness: 100, colorTemp: 6500, sortOrder: 5,
  },
  {
    id: 'light-study', name: 'Study Light', category: 'lighting', roomId: 'study',
    icon: 'lightbulb', commandOn: null, commandOff: null,
    support: 'unconfigured', confirmedState: 'unknown', pendingState: null,
    errorMessage: null, scheduleIds: [], addedAt: now,
    brightness: 90, colorTemp: 5000, sortOrder: 6,
  },

  // --- Fans ---
  {
    id: 'fan-living', name: 'Living Room Fan', category: 'fan', roomId: 'living',
    icon: 'fan', commandOn: null, commandOff: null,
    support: 'demo', confirmedState: 'unknown', pendingState: null,
    errorMessage: 'No motor driver installed', scheduleIds: [], addedAt: now,
    fanSpeed: 3, sortOrder: 7,
  },
  {
    id: 'fan-bedroom', name: 'Bedroom Fan', category: 'fan', roomId: 'bedroom',
    icon: 'fan', commandOn: null, commandOff: null,
    support: 'demo', confirmedState: 'unknown', pendingState: null,
    errorMessage: 'No motor driver installed', scheduleIds: [], addedAt: now,
    fanSpeed: 2, sortOrder: 8,
  },
  {
    id: 'fan-ceiling-1', name: 'Ceiling Fan 1', category: 'fan', roomId: 'living',
    icon: 'fan', commandOn: null, commandOff: null,
    support: 'demo', confirmedState: 'unknown', pendingState: null,
    errorMessage: 'No motor driver installed', scheduleIds: [], addedAt: now,
    fanSpeed: 4, sortOrder: 9,
  },

  // --- Climate (AC) ---
  {
    id: 'ac-bedroom', name: 'AC 1 — Bedroom', category: 'climate', roomId: 'bedroom',
    icon: 'thermometer-snowflake', commandOn: null, commandOff: null,
    support: 'demo', confirmedState: 'unknown', pendingState: null,
    errorMessage: 'No AC interface configured', scheduleIds: [], addedAt: now,
    temperature: 24, sortOrder: 10,
  },
  {
    id: 'ac-living', name: 'AC 2 — Living Room', category: 'climate', roomId: 'living',
    icon: 'thermometer-snowflake', commandOn: null, commandOff: null,
    support: 'demo', confirmedState: 'unknown', pendingState: null,
    errorMessage: 'No AC interface configured', scheduleIds: [], addedAt: now,
    temperature: 23, sortOrder: 11,
  },

  // --- Entertainment ---
  {
    id: 'tv-living', name: 'Living Room TV', category: 'entertainment', roomId: 'living',
    icon: 'tv', commandOn: null, commandOff: null,
    support: 'demo', confirmedState: 'unknown', pendingState: null,
    errorMessage: 'No IR/CEC interface', scheduleIds: [], addedAt: now,
    sortOrder: 12,
  },
  {
    id: 'tv-bedroom', name: 'Bedroom TV', category: 'entertainment', roomId: 'bedroom',
    icon: 'tv', commandOn: null, commandOff: null,
    support: 'demo', confirmedState: 'unknown', pendingState: null,
    errorMessage: 'No IR/CEC interface', scheduleIds: [], addedAt: now,
    sortOrder: 13,
  },

  // --- Water Heating ---
  {
    id: 'geyser-1', name: 'Geyser 1', category: 'water-heating', roomId: 'bathroom',
    icon: 'flame', commandOn: null, commandOff: null,
    support: 'demo', confirmedState: 'unknown', pendingState: null,
    errorMessage: 'Requires rated switching hardware & teacher supervision',
    scheduleIds: [], addedAt: now, sortOrder: 14,
  },
  {
    id: 'geyser-2', name: 'Geyser 2', category: 'water-heating', roomId: 'bathroom',
    icon: 'flame', commandOn: null, commandOff: null,
    support: 'demo', confirmedState: 'unknown', pendingState: null,
    errorMessage: 'Requires rated switching hardware & teacher supervision',
    scheduleIds: [], addedAt: now, sortOrder: 15,
  },

  // --- Outlet ---
  {
    id: 'outlet-study', name: 'Study Outlet', category: 'outlet', roomId: 'study',
    icon: 'plug', commandOn: null, commandOff: null,
    support: 'unconfigured', confirmedState: 'unknown', pendingState: null,
    errorMessage: null, scheduleIds: [], addedAt: now, sortOrder: 16,
  },
];

export const DEFAULT_SCHEDULES: Schedule[] = [
  {
    id: 'sched-1',
    name: 'Bedroom Light — Evening ON',
    deviceIds: ['light-2'],
    action: 'on',
    time: '19:00',
    endTime: null,
    repeat: 'daily',
    days: [0, 1, 2, 3, 4, 5, 6],
    startDate: null,
    endDate: null,
    enabled: true,
    createdAt: now,
    executionScope: 'app-active-only',
  },
  {
    id: 'sched-2',
    name: 'Bedroom Light — Night OFF',
    deviceIds: ['light-2'],
    action: 'off',
    time: '22:30',
    endTime: null,
    repeat: 'daily',
    days: [0, 1, 2, 3, 4, 5, 6],
    startDate: null,
    endDate: null,
    enabled: true,
    createdAt: now,
    executionScope: 'app-active-only',
  },
];

export const DEFAULT_SCENES: Scene[] = [
  {
    id: 'mode-morning', name: 'Morning', icon: 'sunrise', color: '#F59E0B',
    description: 'Wake up gently with warm ambient lighting and fresh airflow.',
    actions: [
      { deviceId: 'light-living', targetState: 'on', brightness: 70 },
      { deviceId: 'light-bedroom', targetState: 'on', brightness: 50 },
      { deviceId: 'fan-living', targetState: 'on', fanSpeed: 2 },
    ],
    isBuiltIn: true, createdAt: now,
  },
  {
    id: 'mode-home', name: 'Home', icon: 'home', color: '#10B981',
    description: 'Comfortable settings for when everyone is home.',
    actions: [
      { deviceId: 'light-living', targetState: 'on', brightness: 80 },
      { deviceId: 'fan-living', targetState: 'on', fanSpeed: 3 },
      { deviceId: 'tv-living', targetState: 'off' },
    ],
    isBuiltIn: true, createdAt: now,
  },
  {
    id: 'mode-focus', name: 'Focus / Study', icon: 'brain', color: '#06B6D4',
    description: 'Maximum concentration with desk lighting and zero distractions.',
    actions: [
      { deviceId: 'light-study', targetState: 'on', brightness: 100 },
      { deviceId: 'tv-living', targetState: 'off' },
      { deviceId: 'tv-bedroom', targetState: 'off' },
    ],
    isBuiltIn: true, createdAt: now,
  },
  {
    id: 'mode-cinema', name: 'Cinema', icon: 'clapperboard', color: '#8B5CF6',
    description: 'Theater dimming with surround sound ambience.',
    actions: [
      { deviceId: 'light-living', targetState: 'off' },
      { deviceId: 'light-bedroom', targetState: 'off' },
      { deviceId: 'tv-living', targetState: 'on' },
      { deviceId: 'fan-living', targetState: 'on', fanSpeed: 1 },
    ],
    isBuiltIn: true, createdAt: now,
  },
  {
    id: 'mode-eco', name: 'Eco Saver', icon: 'leaf', color: '#10B981',
    description: 'Minimize energy usage and reduce your carbon footprint.',
    actions: [
      { deviceId: 'light-living', targetState: 'off' },
      { deviceId: 'light-bedroom', targetState: 'off' },
      { deviceId: 'ac-bedroom', targetState: 'off' },
      { deviceId: 'ac-living', targetState: 'off' },
      { deviceId: 'tv-living', targetState: 'off' },
    ],
    isBuiltIn: true, createdAt: now,
  },
  {
    id: 'mode-away', name: 'Away', icon: 'car', color: '#F59E0B',
    description: 'Save energy when nobody is home. Security armed.',
    actions: [
      { deviceId: 'light-living', targetState: 'off' },
      { deviceId: 'light-bedroom', targetState: 'off' },
      { deviceId: 'fan-living', targetState: 'off' },
      { deviceId: 'fan-bedroom', targetState: 'off' },
      { deviceId: 'ac-bedroom', targetState: 'off' },
      { deviceId: 'tv-living', targetState: 'off' },
    ],
    isBuiltIn: true, createdAt: now,
  },
  {
    id: 'mode-night', name: 'Night', icon: 'moon', color: '#8B5CF6',
    description: 'Wind-down mode for evening hours.',
    actions: [
      { deviceId: 'light-bedroom', targetState: 'on', brightness: 30 },
      { deviceId: 'fan-bedroom', targetState: 'on', fanSpeed: 2 },
      { deviceId: 'tv-living', targetState: 'off' },
    ],
    isBuiltIn: true, createdAt: now,
  },
  {
    id: 'mode-sleep', name: 'Sleep', icon: 'moon-star', color: '#3B82F6',
    description: 'Minimum activity for a good night\'s rest.',
    actions: [
      { deviceId: 'light-living', targetState: 'off' },
      { deviceId: 'light-bedroom', targetState: 'off' },
      { deviceId: 'fan-bedroom', targetState: 'on', fanSpeed: 1 },
      { deviceId: 'ac-bedroom', targetState: 'on', temperature: 24 },
    ],
    isBuiltIn: true, createdAt: now,
  },
  {
    id: 'mode-vacation', name: 'Vacation', icon: 'palmtree', color: '#EC4899',
    description: 'Extended away mode with periodic light simulation.',
    actions: [
      { deviceId: 'light-living', targetState: 'off' },
      { deviceId: 'light-bedroom', targetState: 'off' },
      { deviceId: 'fan-living', targetState: 'off' },
      { deviceId: 'ac-bedroom', targetState: 'off' },
    ],
    isBuiltIn: true, createdAt: now,
  },
  {
    id: 'mode-party', name: 'Party', icon: 'party-popper', color: '#EC4899',
    description: 'Dynamic multi-zone illumination and entertainment.',
    actions: [
      { deviceId: 'light-living', targetState: 'on', brightness: 100 },
      { deviceId: 'light-bedroom', targetState: 'on', brightness: 80 },
      { deviceId: 'tv-living', targetState: 'on' },
      { deviceId: 'fan-living', targetState: 'on', fanSpeed: 4 },
    ],
    isBuiltIn: true, createdAt: now,
  },
];

export const DEFAULT_AUTOMATIONS: Automation[] = [
  {
    id: 'auto-1',
    name: 'Evening Warm Lights',
    trigger: { type: 'time', value: '18:30', condition: 'Living Room Occupied' },
    actions: [
      { deviceId: 'light-living', action: 'set', value: 60 },
      { deviceId: 'light-1', action: 'on' },
    ],
    enabled: true,
    createdAt: now,
  },
  {
    id: 'auto-2',
    name: 'Morning Routine',
    trigger: { type: 'time', value: '06:30' },
    actions: [
      { deviceId: 'light-bedroom', action: 'set', value: 50 },
      { deviceId: 'fan-bedroom', action: 'off' },
    ],
    enabled: true,
    createdAt: now,
  },
  {
    id: 'auto-3',
    name: 'AC Auto-Off at Night',
    trigger: { type: 'time', value: '01:00' },
    actions: [
      { deviceId: 'ac-bedroom', action: 'off' },
      { deviceId: 'ac-living', action: 'off' },
    ],
    enabled: false,
    createdAt: now,
  },
];
