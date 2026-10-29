// ============================================================
// APP STORE — Zustand global state
// ============================================================
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Device, Room, Schedule, BluetoothState, ActivityEvent,
  UserPreferences, DeviceState,
} from '../models/types';
import { DEFAULT_DEVICES, DEFAULT_ROOMS, DEFAULT_SCHEDULES } from '../models/seed';

// ---------- helpers ----------
function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function nowIso() {
  return new Date().toISOString();
}

// ---------- state shape ----------
interface AppState {
  // Data
  devices: Device[];
  rooms: Room[];
  schedules: Schedule[];
  activity: ActivityEvent[];

  // Bluetooth
  bluetooth: BluetoothState;

  // Preferences
  preferences: UserPreferences;

  // ---------- Device actions ----------
  setDeviceState: (id: string, state: DeviceState) => void;
  setPendingState: (id: string, state: DeviceState | null) => void;
  setDeviceError: (id: string, msg: string | null) => void;
  addDevice: (device: Omit<Device, 'id' | 'confirmedState' | 'pendingState' | 'errorMessage' | 'scheduleIds' | 'addedAt'>) => void;
  updateDevice: (id: string, patch: Partial<Device>) => void;
  removeDevice: (id: string) => void;

  // ---------- Room actions ----------
  addRoom: (room: Omit<Room, 'id' | 'deviceIds'>) => void;
  updateRoom: (id: string, patch: Partial<Room>) => void;

  // ---------- Schedule actions ----------
  addSchedule: (schedule: Omit<Schedule, 'id' | 'createdAt' | 'executionScope'>) => void;
  updateSchedule: (id: string, patch: Partial<Schedule>) => void;
  deleteSchedule: (id: string) => void;
  toggleSchedule: (id: string) => void;

  // ---------- Bluetooth actions ----------
  setBluetooth: (patch: Partial<BluetoothState>) => void;

  // ---------- Activity ----------
  addActivity: (event: Omit<ActivityEvent, 'id' | 'timestamp'>) => void;
  clearActivity: () => void;

  // ---------- Preferences ----------
  setPreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  resetDemoData: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // --- initial state ---
      devices: DEFAULT_DEVICES,
      rooms: DEFAULT_ROOMS,
      schedules: DEFAULT_SCHEDULES,
      activity: [],

      bluetooth: {
        status: 'disconnected',
        deviceName: null,
        deviceAddress: null,
        errorMessage: null,
        lastConnectedAt: null,
        isDemo: true,
      },

      preferences: {
        theme: 'system',
        demoMode: true,
        defaultRoomId: null,
        tempUnit: 'C',
        showIntro: true,
        reducedMotion: false,
      },

      // --- Device actions ---
      setDeviceState: (id, state) =>
        set((s) => ({
          devices: s.devices.map((d) =>
            d.id === id ? { ...d, confirmedState: state, pendingState: null, errorMessage: null } : d
          ),
        })),

      setPendingState: (id, state) =>
        set((s) => ({
          devices: s.devices.map((d) =>
            d.id === id ? { ...d, pendingState: state } : d
          ),
        })),

      setDeviceError: (id, msg) =>
        set((s) => ({
          devices: s.devices.map((d) =>
            d.id === id ? { ...d, errorMessage: msg, pendingState: null } : d
          ),
        })),

      addDevice: (device) => {
        const newDevice: Device = {
          ...device,
          id: newId(),
          confirmedState: 'unknown',
          pendingState: null,
          errorMessage: null,
          scheduleIds: [],
          addedAt: nowIso(),
        };
        set((s) => ({
          devices: [...s.devices, newDevice],
          rooms: s.rooms.map((r) =>
            r.id === newDevice.roomId
              ? { ...r, deviceIds: [...r.deviceIds, newDevice.id] }
              : r
          ),
        }));
        get().addActivity({
          category: 'system',
          level: 'info',
          title: `Device "${newDevice.name}" added`,
          detail: null,
          isHardwareConfirmed: false,
        });
      },

      updateDevice: (id, patch) =>
        set((s) => ({
          devices: s.devices.map((d) => (d.id === id ? { ...d, ...patch } : d)),
        })),

      removeDevice: (id) => {
        const device = get().devices.find((d) => d.id === id);
        set((s) => ({
          devices: s.devices.filter((d) => d.id !== id),
          rooms: s.rooms.map((r) => ({
            ...r,
            deviceIds: r.deviceIds.filter((did) => did !== id),
          })),
          schedules: s.schedules.map((sch) => ({
            ...sch,
            deviceIds: sch.deviceIds.filter((did) => did !== id),
          })),
        }));
        if (device) {
          get().addActivity({
            category: 'system',
            level: 'warning',
            title: `Device "${device.name}" removed`,
            detail: null,
            isHardwareConfirmed: false,
          });
        }
      },

      // --- Room actions ---
      addRoom: (room) => {
        const newRoom: Room = { ...room, id: newId(), deviceIds: [] };
        set((s) => ({ rooms: [...s.rooms, newRoom] }));
      },

      updateRoom: (id, patch) =>
        set((s) => ({
          rooms: s.rooms.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),

      // --- Schedule actions ---
      addSchedule: (schedule) => {
        const newSched: Schedule = {
          ...schedule,
          id: newId(),
          createdAt: nowIso(),
          executionScope: 'app-active-only',
        };
        set((s) => ({
          schedules: [...s.schedules, newSched],
          devices: s.devices.map((d) =>
            newSched.deviceIds.includes(d.id)
              ? { ...d, scheduleIds: [...d.scheduleIds, newSched.id] }
              : d
          ),
        }));
        get().addActivity({
          category: 'schedule',
          level: 'info',
          title: `Schedule "${newSched.name}" created`,
          detail: `${newSched.time} · ${newSched.repeat}`,
          isHardwareConfirmed: false,
        });
      },

      updateSchedule: (id, patch) =>
        set((s) => ({
          schedules: s.schedules.map((sch) => (sch.id === id ? { ...sch, ...patch } : sch)),
        })),

      deleteSchedule: (id) => {
        const sched = get().schedules.find((s) => s.id === id);
        set((s) => ({
          schedules: s.schedules.filter((sch) => sch.id !== id),
          devices: s.devices.map((d) => ({
            ...d,
            scheduleIds: d.scheduleIds.filter((sid) => sid !== id),
          })),
        }));
        if (sched) {
          get().addActivity({
            category: 'schedule',
            level: 'warning',
            title: `Schedule "${sched.name}" deleted`,
            detail: null,
            isHardwareConfirmed: false,
          });
        }
      },

      toggleSchedule: (id) => {
        const sched = get().schedules.find((s) => s.id === id);
        if (!sched) return;
        const enabled = !sched.enabled;
        set((s) => ({
          schedules: s.schedules.map((sch) =>
            sch.id === id ? { ...sch, enabled } : sch
          ),
        }));
        get().addActivity({
          category: 'schedule',
          level: 'info',
          title: `Schedule "${sched.name}" ${enabled ? 'enabled' : 'paused'}`,
          detail: null,
          isHardwareConfirmed: false,
        });
      },

      // --- Bluetooth ---
      setBluetooth: (patch) =>
        set((s) => ({ bluetooth: { ...s.bluetooth, ...patch } })),

      // --- Activity ---
      addActivity: (event) =>
        set((s) => ({
          activity: [
            { ...event, id: newId(), timestamp: nowIso() },
            ...s.activity.slice(0, 199),
          ],
        })),

      clearActivity: () => set({ activity: [] }),

      // --- Preferences ---
      setPreference: (key, value) =>
        set((s) => ({ preferences: { ...s.preferences, [key]: value } })),

      resetDemoData: () => {
        set({
          devices: DEFAULT_DEVICES,
          rooms: DEFAULT_ROOMS,
          schedules: DEFAULT_SCHEDULES,
          activity: [],
          bluetooth: {
            status: 'disconnected',
            deviceName: null,
            deviceAddress: null,
            errorMessage: null,
            lastConnectedAt: null,
            isDemo: true,
          },
        });
      },
    }),
    {
      name: 'home-automation-state',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        devices: state.devices,
        rooms: state.rooms,
        schedules: state.schedules,
        activity: state.activity.slice(0, 50), // persist last 50
        preferences: state.preferences,
        bluetooth: {
          ...state.bluetooth,
          status: 'disconnected', // always start disconnected
          deviceName: state.bluetooth.deviceName,
          deviceAddress: state.bluetooth.deviceAddress,
        },
      }),
    }
  )
);
