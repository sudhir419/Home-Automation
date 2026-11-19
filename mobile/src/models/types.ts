// ============================================================
// DATA MODELS — React Native Home Automation
// Ported from web app with native enhancements
// ============================================================

export type DeviceCategory =
  | 'lighting'
  | 'fan'
  | 'climate'
  | 'entertainment'
  | 'water-heating'
  | 'outlet'
  | 'security'
  | 'other';

export type DeviceState =
  | 'on'
  | 'off'
  | 'unknown'
  | 'pending'
  | 'error'
  | 'disconnected'
  | 'updating';

export type DeviceSupport =
  | 'supported'    // confirmed by hardware
  | 'unconfigured' // UI only, no HW output
  | 'demo';        // simulated in demo mode

export interface Device {
  id: string;
  name: string;
  category: DeviceCategory;
  roomId: string;
  icon: string;
  commandOn: string | null;
  commandOff: string | null;
  support: DeviceSupport;
  confirmedState: DeviceState;
  pendingState: DeviceState | null;
  errorMessage: string | null;
  scheduleIds: string[];
  addedAt: string;
  // Native enhancements
  brightness?: number;        // 0-100 for lights
  fanSpeed?: number;          // 1-5 for fans
  temperature?: number;       // target temp for AC
  colorTemp?: number;         // Kelvin for lights (2700-6500)
  isFavorite?: boolean;
  sortOrder?: number;
  lastChangedAt?: string;
  protocol?: 'ble' | 'wifi' | 'zigbee' | 'matter';
  rssi?: number;              // signal strength
  firmware?: string;
  uptime?: number;            // seconds
}

export interface Room {
  id: string;
  name: string;
  icon: string;
  deviceIds: string[];
  sortOrder?: number;
  ambientTemp?: number;
  humidity?: number;
}

export type ScheduleAction = 'on' | 'off';
export type RepeatFrequency = 'once' | 'daily' | 'weekly' | 'weekdays' | 'weekends';

export interface Schedule {
  id: string;
  name: string;
  deviceIds: string[];
  action: ScheduleAction;
  time: string;
  endTime: string | null;
  repeat: RepeatFrequency;
  days: number[];
  startDate: string | null;
  endDate: string | null;
  enabled: boolean;
  createdAt: string;
  executionScope: 'app-active-only';
}

// Automation rules (IF/THEN)
export type TriggerType = 'time' | 'schedule' | 'sunrise' | 'sunset' | 'sensor' | 'occupancy' | 'device-state';

export interface AutomationTrigger {
  type: TriggerType;
  value: string;        // e.g., "18:30", "motion-detected", "light-1:on"
  condition?: string;   // e.g., "occupied", ">25°C"
}

export interface AutomationAction {
  deviceId: string;
  action: 'on' | 'off' | 'set';
  value?: number;       // brightness, temp, speed
}

export interface Automation {
  id: string;
  name: string;
  trigger: AutomationTrigger;
  actions: AutomationAction[];
  enabled: boolean;
  createdAt: string;
  lastTriggeredAt?: string;
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
  rssi?: number;
}

export type ConnectionMode = 'bluetooth' | 'local' | 'cloud' | 'offline';

export interface ConnectionState {
  mode: ConnectionMode;
  latencyMs: number;
  label: string;  // "Cloud Synced — 24ms", "Local Edge — 8ms", "Bluetooth — Connected"
}

export type ActivityCategory = 'bluetooth' | 'device' | 'schedule' | 'system' | 'security' | 'automation';
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

export type ThemeMode = 'light' | 'dark' | 'system';
export type TempUnit = 'C' | 'F';

export interface UserPreferences {
  theme: ThemeMode;
  demoMode: boolean;
  defaultRoomId: string | null;
  tempUnit: TempUnit;
  showIntro: boolean;
  reducedMotion: boolean;
  activeMode: string | null;
  biometricEnabled: boolean;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  locale: string;
}

// Scene / Mode types
export interface SceneAction {
  deviceId: string;
  targetState: DeviceState;
  brightness?: number;
  fanSpeed?: number;
  temperature?: number;
}

export interface Scene {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  actions: SceneAction[];
  isBuiltIn: boolean;
  createdAt: string;
}

export type SecurityArmState = 'disarmed' | 'home' | 'away' | 'night';

export interface SecurityState {
  armState: SecurityArmState;
  doorLocked: boolean;
  motionDetected: boolean;
  windowsClosed: boolean;
  lastEventAt: string | null;
  panicActive: boolean;
}

// Hardware diagnostics
export interface NodeHealth {
  deviceId: string;
  protocol: string;
  rssi: number;
  firmware: string;
  uptime: number;
  lastSeen: string;
}

// Guest access
export interface GuestPass {
  id: string;
  name: string;
  roomIds: string[];
  deviceIds: string[];
  expiresAt: string;
  createdAt: string;
  qrPayload: string;
}

// Energy telemetry
export interface EnergySnapshot {
  timestamp: string;
  totalWatts: number;
  totalKWh: number;
  roomBreakdown: Record<string, number>;
}
