// ============================================================
// SEED DATA — Default devices, rooms, and demo schedules
// ============================================================
import type { Device, Room, Schedule } from './types';

export const DEFAULT_ROOMS: Room[] = [
  { id: 'living', name: 'Living Room', icon: 'Sofa', deviceIds: ['light-living', 'fan-living', 'tv-living'] },
  { id: 'bedroom', name: 'Bedroom', icon: 'BedDouble', deviceIds: ['light-bedroom', 'fan-bedroom', 'ac-bedroom'] },
  { id: 'kitchen', name: 'Kitchen', icon: 'UtensilsCrossed', deviceIds: ['light-kitchen'] },
  { id: 'bathroom', name: 'Bathroom', icon: 'Bath', deviceIds: ['geyser-1'] },
  { id: 'study', name: 'Study Room', icon: 'BookOpen', deviceIds: ['light-study', 'outlet-study'] },
  { id: 'outdoor', name: 'Outdoor', icon: 'TreePine', deviceIds: ['light-outdoor'] },
];

export const DEFAULT_DEVICES: Device[] = [
  // --- Lighting (L1, L2 = real HW; rest = unconfigured) ---
  {
    id: 'light-1', name: 'Light 1', category: 'lighting', roomId: 'living',
    icon: 'Lightbulb', commandOn: 'L1_ON', commandOff: 'L1_OFF',
    support: 'supported', confirmedState: 'off', pendingState: null,
    errorMessage: null, scheduleIds: [], addedAt: new Date().toISOString(),
  },
  {
    id: 'light-2', name: 'Light 2', category: 'lighting', roomId: 'bedroom',
    icon: 'Lightbulb', commandOn: 'L2_ON', commandOff: 'L2_OFF',
    support: 'supported', confirmedState: 'off', pendingState: null,
    errorMessage: null, scheduleIds: [], addedAt: new Date().toISOString(),
  },
  {
    id: 'light-living', name: 'Living Room Light', category: 'lighting', roomId: 'living',
    icon: 'Lightbulb', commandOn: null, commandOff: null,
    support: 'unconfigured', confirmedState: 'unknown', pendingState: null,
    errorMessage: null, scheduleIds: [], addedAt: new Date().toISOString(),
  },
  {
    id: 'light-bedroom', name: 'Bedroom Light', category: 'lighting', roomId: 'bedroom',
    icon: 'Lightbulb', commandOn: null, commandOff: null,
    support: 'unconfigured', confirmedState: 'unknown', pendingState: null,
    errorMessage: null, scheduleIds: [], addedAt: new Date().toISOString(),
  },
  {
    id: 'light-kitchen', name: 'Kitchen Light', category: 'lighting', roomId: 'kitchen',
    icon: 'Lightbulb', commandOn: null, commandOff: null,
    support: 'unconfigured', confirmedState: 'unknown', pendingState: null,
    errorMessage: null, scheduleIds: [], addedAt: new Date().toISOString(),
  },
  {
    id: 'light-outdoor', name: 'Outdoor Light', category: 'lighting', roomId: 'outdoor',
    icon: 'Lightbulb', commandOn: null, commandOff: null,
    support: 'unconfigured', confirmedState: 'unknown', pendingState: null,
    errorMessage: null, scheduleIds: [], addedAt: new Date().toISOString(),
  },
  {
    id: 'light-study', name: 'Study Light', category: 'lighting', roomId: 'study',
    icon: 'Lightbulb', commandOn: null, commandOff: null,
    support: 'unconfigured', confirmedState: 'unknown', pendingState: null,
    errorMessage: null, scheduleIds: [], addedAt: new Date().toISOString(),
  },

  // --- Fans (all demo/unconfigured until motor driver installed) ---
  {
    id: 'fan-living', name: 'Living Room Fan', category: 'fan', roomId: 'living',
    icon: 'Wind', commandOn: null, commandOff: null,
    support: 'demo', confirmedState: 'unknown', pendingState: null,
    errorMessage: 'No motor driver installed', scheduleIds: [], addedAt: new Date().toISOString(),
  },
  {
    id: 'fan-bedroom', name: 'Bedroom Fan', category: 'fan', roomId: 'bedroom',
    icon: 'Wind', commandOn: null, commandOff: null,
    support: 'demo', confirmedState: 'unknown', pendingState: null,
    errorMessage: 'No motor driver installed', scheduleIds: [], addedAt: new Date().toISOString(),
  },
  {
    id: 'fan-ceiling-1', name: 'Ceiling Fan 1', category: 'fan', roomId: 'living',
    icon: 'Wind', commandOn: null, commandOff: null,
    support: 'demo', confirmedState: 'unknown', pendingState: null,
    errorMessage: 'No motor driver installed', scheduleIds: [], addedAt: new Date().toISOString(),
  },

  // --- Climate (all demo) ---
  {
    id: 'ac-bedroom', name: 'AC 1 — Bedroom', category: 'climate', roomId: 'bedroom',
    icon: 'Thermometer', commandOn: null, commandOff: null,
    support: 'demo', confirmedState: 'unknown', pendingState: null,
    errorMessage: 'No AC interface configured', scheduleIds: [], addedAt: new Date().toISOString(),
  },
  {
    id: 'ac-living', name: 'AC 2 — Living Room', category: 'climate', roomId: 'living',
    icon: 'Thermometer', commandOn: null, commandOff: null,
    support: 'demo', confirmedState: 'unknown', pendingState: null,
    errorMessage: 'No AC interface configured', scheduleIds: [], addedAt: new Date().toISOString(),
  },

  // --- Entertainment (all demo) ---
  {
    id: 'tv-living', name: 'Living Room TV', category: 'entertainment', roomId: 'living',
    icon: 'Tv', commandOn: null, commandOff: null,
    support: 'demo', confirmedState: 'unknown', pendingState: null,
    errorMessage: 'No IR/CEC interface', scheduleIds: [], addedAt: new Date().toISOString(),
  },
  {
    id: 'tv-bedroom', name: 'Bedroom TV', category: 'entertainment', roomId: 'bedroom',
    icon: 'Tv', commandOn: null, commandOff: null,
    support: 'demo', confirmedState: 'unknown', pendingState: null,
    errorMessage: 'No IR/CEC interface', scheduleIds: [], addedAt: new Date().toISOString(),
  },

  // --- Water Heating (demo — mains hazard) ---
  {
    id: 'geyser-1', name: 'Geyser 1', category: 'water-heating', roomId: 'bathroom',
    icon: 'Flame', commandOn: null, commandOff: null,
    support: 'demo', confirmedState: 'unknown', pendingState: null,
    errorMessage: 'Requires rated switching hardware & teacher supervision',
    scheduleIds: [], addedAt: new Date().toISOString(),
  },
  {
    id: 'geyser-2', name: 'Geyser 2', category: 'water-heating', roomId: 'bathroom',
    icon: 'Flame', commandOn: null, commandOff: null,
    support: 'demo', confirmedState: 'unknown', pendingState: null,
    errorMessage: 'Requires rated switching hardware & teacher supervision',
    scheduleIds: [], addedAt: new Date().toISOString(),
  },

  // --- Other ---
  {
    id: 'outlet-study', name: 'Study Outlet', category: 'outlet', roomId: 'study',
    icon: 'Plug', commandOn: null, commandOff: null,
    support: 'unconfigured', confirmedState: 'unknown', pendingState: null,
    errorMessage: null, scheduleIds: [], addedAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
    executionScope: 'app-active-only',
  },
];
