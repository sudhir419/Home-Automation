// ============================================================
// ELECTRICITY SERVICE — Precise calculations & analytics engine
// ============================================================
import type { Device, DeviceCategory, Room } from '../../models/types';
import {
  subDays, startOfDay, endOfDay, startOfWeek, endOfWeek,
  startOfMonth, endOfMonth, isWithinInterval, differenceInMinutes,
  format, subHours,
} from 'date-fns';

export type TimeFilter = 'today' | 'yesterday' | 'week' | 'month' | 'last7days' | 'custom';

export interface DeviceSession {
  id: string;
  deviceId: string;
  startTime: string; // ISO string
  endTime: string | null; // null if actively running right now
  durationMinutes: number;
  energyKWh: number; // Formula: (Power W * (durationMinutes / 60)) / 1000
}

export interface DeviceConsumptionSummary {
  deviceId: string;
  deviceName: string;
  category: DeviceCategory;
  roomId: string;
  powerWatts: number;
  isCurrentlyOn: boolean;
  totalOperatingMinutes: number;
  totalOperatingHours: number;
  totalKWh: number;
  estimatedCost: number; // in local currency (e.g. ₹8 / kWh)
  sessionCount: number;
  sessions: DeviceSession[];
  avgSessionMinutes: number;
  lastActiveSession: DeviceSession | null;
}

export interface RoomConsumptionSummary {
  roomId: string;
  roomName: string;
  roomIcon: string;
  deviceCount: number;
  activeDeviceCount: number;
  totalWattsRunning: number;
  totalKWh: number;
  totalOperatingHours: number;
  percentageOfTotal: number;
  deviceSummaries: DeviceConsumptionSummary[];
  topConsumingDeviceName: string;
}

export interface HourlyConsumptionPoint {
  hour: number; // 0..23
  label: string; // "12 AM", "1 AM", ...
  kWh: number;
  watts: number;
}

export interface DailyConsumptionPoint {
  date: string; // "YYYY-MM-DD"
  label: string; // "Mon", "Tue", ...
  kWh: number;
  cost: number;
}

export interface CategoryBreakdownPoint {
  category: DeviceCategory;
  label: string;
  kWh: number;
  percentage: number;
  color: string;
}

// ------------------------------------------------------------
// Calibrated Power Ratings by Device ID & Category (in Watts)
// ------------------------------------------------------------
export const DEVICE_POWER_RATINGS: Record<string, number> = {
  // Lighting (Energy-efficient LED fixtures)
  'light-1': 18,
  'light-2': 18,
  'light-living': 28,
  'light-bedroom': 22,
  'light-kitchen': 24,
  'light-outdoor': 45,
  'light-study': 20,

  // Fans (BLDC & Induction ceiling motors)
  'fan-living': 70,
  'fan-bedroom': 65,
  'fan-ceiling-1': 65,

  // Climate (Inverter Split Air Conditioners)
  'ac-bedroom': 1450,
  'ac-living': 1850,

  // Entertainment (4K Smart LED Displays & Audio)
  'tv-living': 140,
  'tv-bedroom': 110,

  // Water Heating (High-wattage storage geysers)
  'geyser-1': 2000,
  'geyser-2': 2000,

  // Outlets / General Loads
  'outlet-study': 150,
};

// Fallback category average wattage
export const CATEGORY_DEFAULT_WATTS: Record<DeviceCategory, number> = {
  lighting: 20,
  fan: 65,
  climate: 1500,
  entertainment: 125,
  'water-heating': 2000,
  outlet: 150,
  other: 100,
};

export const ELECTRICITY_TARIFF_PER_KWH = 8.0; // ₹8.00 per kWh standard residential tier

export function getDeviceWatts(device: Device): number {
  return DEVICE_POWER_RATINGS[device.id] ?? CATEGORY_DEFAULT_WATTS[device.category] ?? 50;
}

// ------------------------------------------------------------
// Deterministic Realistic Seed Sessions Generator
// Generated consistently for past 30 days based on device ID
// ------------------------------------------------------------
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export function generateHistoricalSessions(device: Device, referenceDate = new Date()): DeviceSession[] {
  const sessions: DeviceSession[] = [];
  const powerW = getDeviceWatts(device);
  let seed = 0;
  for (let c = 0; c < device.id.length; c++) {
    seed += device.id.charCodeAt(c);
  }

  // Generate for past 30 days
  for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
    const targetDate = subDays(referenceDate, dayOffset);
    const daySeed = seed + dayOffset * 31;
    const isToday = dayOffset === 0;

    // Pattern archetypes depending on device category
    switch (device.category) {
      case 'lighting': {
        // Morning lighting (06:00 - 07:30)
        if (pseudoRandom(daySeed + 1) > 0.35) {
          const startM = 360 + Math.floor(pseudoRandom(daySeed + 2) * 45); // ~6:00 - 6:45
          const dur = 40 + Math.floor(pseudoRandom(daySeed + 3) * 60); // 40-100 mins
          addSession(sessions, device.id, targetDate, startM, dur, powerW, isToday, referenceDate);
        }
        // Evening lighting (18:15 - 22:45)
        if (pseudoRandom(daySeed + 4) > 0.15) {
          const startM = 1095 + Math.floor(pseudoRandom(daySeed + 5) * 60); // ~18:15 - 19:15
          const dur = 120 + Math.floor(pseudoRandom(daySeed + 6) * 150); // 2 to 4.5 hours
          addSession(sessions, device.id, targetDate, startM, dur, powerW, isToday, referenceDate);
        }
        break;
      }

      case 'fan': {
        // Afternoon breeze
        if (pseudoRandom(daySeed + 7) > 0.4) {
          const startM = 780 + Math.floor(pseudoRandom(daySeed + 8) * 60); // ~13:00
          const dur = 90 + Math.floor(pseudoRandom(daySeed + 9) * 150);
          addSession(sessions, device.id, targetDate, startM, dur, powerW, isToday, referenceDate);
        }
        // Night sleep fan
        if (pseudoRandom(daySeed + 10) > 0.25) {
          const startM = 1380 + Math.floor(pseudoRandom(daySeed + 11) * 30); // ~23:00
          const dur = 300 + Math.floor(pseudoRandom(daySeed + 12) * 120); // 5-7 hours
          addSession(sessions, device.id, targetDate, startM, dur, powerW, isToday, referenceDate);
        }
        break;
      }

      case 'climate': {
        // AC running afternoon or night
        if (pseudoRandom(daySeed + 13) > 0.45) {
          const startM = 810 + Math.floor(pseudoRandom(daySeed + 14) * 60); // ~13:30
          const dur = 90 + Math.floor(pseudoRandom(daySeed + 15) * 120); // 1.5 - 3.5 hrs
          addSession(sessions, device.id, targetDate, startM, dur, powerW, isToday, referenceDate);
        }
        if (pseudoRandom(daySeed + 16) > 0.3) {
          const startM = 1350 + Math.floor(pseudoRandom(daySeed + 17) * 45); // ~22:30
          const dur = 180 + Math.floor(pseudoRandom(daySeed + 18) * 180); // 3 - 6 hrs
          addSession(sessions, device.id, targetDate, startM, dur, powerW, isToday, referenceDate);
        }
        break;
      }

      case 'entertainment': {
        // TV watching in evening
        if (pseudoRandom(daySeed + 19) > 0.25) {
          const startM = 1170 + Math.floor(pseudoRandom(daySeed + 20) * 60); // ~19:30
          const dur = 60 + Math.floor(pseudoRandom(daySeed + 21) * 150); // 1 to 3.5 hrs
          addSession(sessions, device.id, targetDate, startM, dur, powerW, isToday, referenceDate);
        }
        break;
      }

      case 'water-heating': {
        // Geyser used in morning (30 to 50 mins)
        if (pseudoRandom(daySeed + 22) > 0.2) {
          const startM = 400 + Math.floor(pseudoRandom(daySeed + 23) * 60); // ~06:40 - 07:40
          const dur = 25 + Math.floor(pseudoRandom(daySeed + 24) * 35); // 25-60 mins
          addSession(sessions, device.id, targetDate, startM, dur, powerW, isToday, referenceDate);
        }
        // Occasional evening hot shower
        if (pseudoRandom(daySeed + 25) > 0.7) {
          const startM = 1200 + Math.floor(pseudoRandom(daySeed + 26) * 45); // ~20:00
          const dur = 20 + Math.floor(pseudoRandom(daySeed + 27) * 25);
          addSession(sessions, device.id, targetDate, startM, dur, powerW, isToday, referenceDate);
        }
        break;
      }

      default: {
        // Outlets / generic devices
        if (pseudoRandom(daySeed + 28) > 0.4) {
          const startM = 600 + Math.floor(pseudoRandom(daySeed + 29) * 120); // ~10:00
          const dur = 60 + Math.floor(pseudoRandom(daySeed + 30) * 180);
          addSession(sessions, device.id, targetDate, startM, dur, powerW, isToday, referenceDate);
        }
        break;
      }
    }
  }

  // If the device is currently turned ON in the actual app store right now,
  // ensure an active session is running up to this second!
  if (device.confirmedState === 'on') {
    const liveStart = subHours(referenceDate, 1.25); // started 1h 15m ago
    const activeDurMinutes = differenceInMinutes(referenceDate, liveStart);
    const activeKWh = (powerW * (activeDurMinutes / 60)) / 1000;

    sessions.push({
      id: `${device.id}-live-active`,
      deviceId: device.id,
      startTime: liveStart.toISOString(),
      endTime: null, // actively ON right now
      durationMinutes: Math.max(1, activeDurMinutes),
      energyKWh: Number(activeKWh.toFixed(3)),
    });
  }

  // Sort descending by start time (newest first)
  return sessions.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
}

function addSession(
  list: DeviceSession[],
  deviceId: string,
  targetDay: Date,
  startMinuteOfDay: number,
  durationMinutes: number,
  powerWatts: number,
  isToday: boolean,
  now: Date
) {
  const d = new Date(targetDay);
  d.setHours(Math.floor(startMinuteOfDay / 60), startMinuteOfDay % 60, 0, 0);

  // If today and start time is in future, skip
  if (isToday && d.getTime() > now.getTime()) {
    return;
  }

  let endD = new Date(d.getTime() + durationMinutes * 60 * 1000);
  if (isToday && endD.getTime() > now.getTime()) {
    durationMinutes = Math.max(5, differenceInMinutes(now, d));
    endD = now;
  }

  const hours = durationMinutes / 60;
  const energyKWh = (powerWatts * hours) / 1000;

  list.push({
    id: `${deviceId}-${d.getTime()}`,
    deviceId,
    startTime: d.toISOString(),
    endTime: endD.toISOString(),
    durationMinutes,
    energyKWh: Number(energyKWh.toFixed(3)),
  });
}

// ------------------------------------------------------------
// Date Interval Helper for Filters
// ------------------------------------------------------------
export function getDateIntervalForFilter(filter: TimeFilter, customRange?: { start: Date; end: Date }, now = new Date()): { start: Date; end: Date } {
  switch (filter) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now) };
    case 'yesterday': {
      const y = subDays(now, 1);
      return { start: startOfDay(y), end: endOfDay(y) };
    }
    case 'week':
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
    case 'last7days':
      return { start: startOfDay(subDays(now, 6)), end: endOfDay(now) };
    case 'month':
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case 'custom':
      if (customRange?.start && customRange?.end) {
        return { start: startOfDay(customRange.start), end: endOfDay(customRange.end) };
      }
      return { start: startOfDay(subDays(now, 6)), end: endOfDay(now) };
  }
}

// ------------------------------------------------------------
// Computation Methods
// ------------------------------------------------------------
export function summarizeDevice(
  device: Device,
  allSessions: DeviceSession[],
  interval: { start: Date; end: Date }
): DeviceConsumptionSummary {
  const powerWatts = getDeviceWatts(device);
  const isCurrentlyOn = device.confirmedState === 'on';

  // Filter sessions that fall within the interval
  const filteredSessions = allSessions.filter((s) => {
    const sStart = new Date(s.startTime);
    return isWithinInterval(sStart, interval);
  });

  let totalMinutes = 0;
  let totalKWh = 0;

  for (const s of filteredSessions) {
    totalMinutes += s.durationMinutes;
    totalKWh += s.energyKWh;
  }

  const totalHours = totalMinutes / 60;
  const estimatedCost = totalKWh * ELECTRICITY_TARIFF_PER_KWH;
  const sessionCount = filteredSessions.length;
  const avgSessionMinutes = sessionCount > 0 ? Math.round(totalMinutes / sessionCount) : 0;
  const lastActiveSession = filteredSessions[0] || null;

  return {
    deviceId: device.id,
    deviceName: device.name,
    category: device.category,
    roomId: device.roomId,
    powerWatts,
    isCurrentlyOn,
    totalOperatingMinutes: totalMinutes,
    totalOperatingHours: Number(totalHours.toFixed(1)),
    totalKWh: Number(totalKWh.toFixed(2)),
    estimatedCost: Number(estimatedCost.toFixed(2)),
    sessionCount,
    sessions: filteredSessions,
    avgSessionMinutes,
    lastActiveSession,
  };
}

export function summarizeRooms(
  rooms: Room[],
  devices: Device[],
  deviceSessionsMap: Map<string, DeviceSession[]>,
  interval: { start: Date; end: Date }
): { roomSummaries: RoomConsumptionSummary[]; totalHouseKWh: number; totalHouseWatts: number } {
  const deviceSummariesMap = new Map<string, DeviceConsumptionSummary>();

  for (const dev of devices) {
    const sessions = deviceSessionsMap.get(dev.id) || [];
    const summary = summarizeDevice(dev, sessions, interval);
    deviceSummariesMap.set(dev.id, summary);
  }

  let totalHouseKWh = 0;
  let totalHouseWatts = 0;

  for (const [, summary] of deviceSummariesMap) {
    totalHouseKWh += summary.totalKWh;
    if (summary.isCurrentlyOn) {
      totalHouseWatts += summary.powerWatts;
    }
  }

  const roomSummaries: RoomConsumptionSummary[] = rooms.map((room) => {
    const roomDevices = devices.filter((d) => d.roomId === room.id);
    const summaries = roomDevices
      .map((d) => deviceSummariesMap.get(d.id)!)
      .filter(Boolean);

    let roomKWh = 0;
    let roomWattsRunning = 0;
    let roomMinutes = 0;
    let activeCount = 0;

    let topDeviceName = 'None';
    let topDeviceKWh = -1;

    for (const dSum of summaries) {
      roomKWh += dSum.totalKWh;
      roomMinutes += dSum.totalOperatingMinutes;
      if (dSum.isCurrentlyOn) {
        activeCount++;
        roomWattsRunning += dSum.powerWatts;
      }
      if (dSum.totalKWh > topDeviceKWh) {
        topDeviceKWh = dSum.totalKWh;
        topDeviceName = dSum.deviceName;
      }
    }

    const percentage = totalHouseKWh > 0 ? Number(((roomKWh / totalHouseKWh) * 100).toFixed(1)) : 0;

    return {
      roomId: room.id,
      roomName: room.name,
      roomIcon: room.icon,
      deviceCount: roomDevices.length,
      activeDeviceCount: activeCount,
      totalWattsRunning: roomWattsRunning,
      totalKWh: Number(roomKWh.toFixed(2)),
      totalOperatingHours: Number((roomMinutes / 60).toFixed(1)),
      percentageOfTotal: percentage,
      deviceSummaries: summaries,
      topConsumingDeviceName: topDeviceName,
    };
  });

  // Sort descending by highest kWh consumption
  roomSummaries.sort((a, b) => b.totalKWh - a.totalKWh);

  return {
    roomSummaries,
    totalHouseKWh: Number(totalHouseKWh.toFixed(2)),
    totalHouseWatts,
  };
}

// ------------------------------------------------------------
// Chart Data Aggregators
// ------------------------------------------------------------
export function getHourlyTimelinePoints(
  devices: Device[],
  deviceSessionsMap: Map<string, DeviceSession[]>,
  targetDay: Date
): HourlyConsumptionPoint[] {
  const points: HourlyConsumptionPoint[] = [];
  const startDay = startOfDay(targetDay);

  for (let h = 0; h < 24; h++) {
    const hourStart = new Date(startDay.getTime() + h * 60 * 60 * 1000);
    const hourEnd = new Date(startDay.getTime() + (h + 1) * 60 * 60 * 1000);
    let hourKWh = 0;

    for (const dev of devices) {
      const powerW = getDeviceWatts(dev);
      const sessions = deviceSessionsMap.get(dev.id) || [];
      for (const s of sessions) {
        const sStart = new Date(s.startTime);
        const sEnd = s.endTime ? new Date(s.endTime) : new Date();

        // Calculate overlap with this hour
        const overlapStart = Math.max(hourStart.getTime(), sStart.getTime());
        const overlapEnd = Math.min(hourEnd.getTime(), sEnd.getTime());
        if (overlapEnd > overlapStart) {
          const overlapMinutes = (overlapEnd - overlapStart) / (1000 * 60);
          hourKWh += (powerW * (overlapMinutes / 60)) / 1000;
        }
      }
    }

    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    points.push({
      hour: h,
      label: `${displayH} ${period}`,
      kWh: Number(hourKWh.toFixed(3)),
      watts: Math.round(hourKWh * 1000),
    });
  }

  return points;
}

export function getDailyTimelinePoints(
  devices: Device[],
  deviceSessionsMap: Map<string, DeviceSession[]>,
  interval: { start: Date; end: Date }
): DailyConsumptionPoint[] {
  const points: DailyConsumptionPoint[] = [];
  const cur = new Date(interval.start);

  while (cur <= interval.end) {
    const dStart = startOfDay(cur);
    const dEnd = endOfDay(cur);
    let dayKWh = 0;

    for (const dev of devices) {
      const sessions = deviceSessionsMap.get(dev.id) || [];
      for (const s of sessions) {
        const sStart = new Date(s.startTime);
        if (isWithinInterval(sStart, { start: dStart, end: dEnd })) {
          dayKWh += s.energyKWh;
        }
      }
    }

    points.push({
      date: format(cur, 'yyyy-MM-dd'),
      label: format(cur, 'EEE, d MMM'),
      kWh: Number(dayKWh.toFixed(2)),
      cost: Number((dayKWh * ELECTRICITY_TARIFF_PER_KWH).toFixed(1)),
    });

    cur.setDate(cur.getDate() + 1);
  }

  return points;
}

export function getCategoryBreakdown(
  devices: Device[],
  deviceSessionsMap: Map<string, DeviceSession[]>,
  interval: { start: Date; end: Date }
): CategoryBreakdownPoint[] {
  const categoryKWh: Record<DeviceCategory, number> = {
    lighting: 0,
    fan: 0,
    climate: 0,
    entertainment: 0,
    'water-heating': 0,
    outlet: 0,
    other: 0,
  };

  let total = 0;

  for (const dev of devices) {
    const sessions = deviceSessionsMap.get(dev.id) || [];
    for (const s of sessions) {
      const sStart = new Date(s.startTime);
      if (isWithinInterval(sStart, interval)) {
        categoryKWh[dev.category] += s.energyKWh;
        total += s.energyKWh;
      }
    }
  }

  const categoryColors: Record<DeviceCategory, string> = {
    climate: '#3E604F', // Deep Sage
    'water-heating': '#7A574E', // Rosewood
    entertainment: '#3A6D8C', // Classical Blue
    fan: '#5B8C71', // Mid Sage
    lighting: '#D97706', // Warm Amber
    outlet: '#6366F1', // Indigo
    other: '#928A85', // Warm Grey
  };

  const labels: Record<DeviceCategory, string> = {
    climate: 'Air Conditioning',
    'water-heating': 'Water Heaters / Geyser',
    entertainment: 'Entertainment / TV',
    fan: 'Fans & Ventilation',
    lighting: 'Lighting Fixtures',
    outlet: 'Smart Outlets',
    other: 'Other Appliances',
  };

  const points: CategoryBreakdownPoint[] = [];

  for (const cat of Object.keys(categoryKWh) as DeviceCategory[]) {
    const kWh = Number(categoryKWh[cat].toFixed(2));
    if (kWh > 0 || total === 0) {
      const pct = total > 0 ? Number(((kWh / total) * 100).toFixed(1)) : 0;
      points.push({
        category: cat,
        label: labels[cat],
        kWh,
        percentage: pct,
        color: categoryColors[cat],
      });
    }
  }

  return points.sort((a, b) => b.kWh - a.kWh);
}
