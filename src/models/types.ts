// ============================================================
// DATA MODELS — Home Automation
// ============================================================

export type DeviceCategory =
  | 'lighting'
  | 'fan'
  | 'climate'
  | 'entertainment'
  | 'water-heating'
  | 'outlet'
  | 'other';

export type DeviceState =
  | 'on'
  | 'off'
  | 'unknown'
  | 'pending'
  | 'error'
  | 'disconnected';

export type DeviceSupport =
  | 'supported'    // confirmed by hardware
  | 'unconfigured' // UI only, no HW output
  | 'demo';        // simulated in demo mode

export interface Device {
  id: string;
  name: string;
  category: DeviceCategory;
  roomId: string;
  icon: string;             // lucide icon name
  commandOn: string | null; // e.g. "L1_ON"
  commandOff: string | null;
  support: DeviceSupport;
  confirmedState: DeviceState;
  pendingState: DeviceState | null;
  errorMessage: string | null;
  scheduleIds: string[];
  addedAt: string;          // ISO
}

export interface Room {
  id: string;
  name: string;
  icon: string;
  deviceIds: string[];
}

export type ScheduleAction = 'on' | 'off';
export type RepeatFrequency = 'once' | 'daily' | 'weekly' | 'weekdays' | 'weekends';

export interface Schedule {
  id: string;
  name: string;
  deviceIds: string[];
  action: ScheduleAction;
  time: string;             // "HH:mm"
  endTime: string | null;   // optional
  repeat: RepeatFrequency;
  days: number[];           // 0=Sun … 6=Sat
  startDate: string | null; // ISO date
  endDate: string | null;
  enabled: boolean;
  createdAt: string;
  executionScope: 'app-active-only'; // Always. Hardware scope TBD.
}

export type BluetoothStatus =
  | 'unavailable'
  | 'permission-required'
  | 'ready'
  | 'scanning'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error';

export interface BluetoothState {
  status: BluetoothStatus;
  deviceName: string | null;
  deviceAddress: string | null;
  errorMessage: string | null;
  lastConnectedAt: string | null;
  isDemo: boolean;
}

export type ActivityCategory = 'bluetooth' | 'device' | 'schedule' | 'system';
export type ActivityLevel = 'info' | 'success' | 'warning' | 'error';

export interface ActivityEvent {
  id: string;
  category: ActivityCategory;
  level: ActivityLevel;
  title: string;
  detail: string | null;
  timestamp: string;
  isHardwareConfirmed: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  demoMode: boolean;
  defaultRoomId: string | null;
  tempUnit: 'C' | 'F';
  showIntro: boolean;
  reducedMotion: boolean;
}
