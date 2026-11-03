import sqlite3 from 'sqlite3';
import { config } from '../config/index.js';
import path from 'path';

const sqlite = sqlite3.verbose();

export class Database {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite.Database(config.dbPath, (err) => {
      if (err) {
        console.error('❌ Could not connect to SQLite database:', err.message);
      } else {
        console.log(`✅ SQLite connected successfully at: ${config.dbPath}`);
      }
    });
  }

  public run(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  public get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row as T);
      });
    });
  }

  public all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows as T[]);
      });
    });
  }

  public async initSchema(): Promise<void> {
    console.log('🔄 Initializing SQLite database schema...');

    // 1. Users
    await this.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Controllers
    await this.run(`
      CREATE TABLE IF NOT EXISTS controllers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        mac_address TEXT UNIQUE,
        ip_address TEXT,
        firmware_version TEXT,
        status TEXT NOT NULL DEFAULT 'offline',
        last_heartbeat DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Rooms
    await this.run(`
      CREATE TABLE IF NOT EXISTS rooms (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT NOT NULL,
        display_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Devices
    await this.run(`
      CREATE TABLE IF NOT EXISTS devices (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
        controller_id TEXT NOT NULL REFERENCES controllers(id),
        icon TEXT NOT NULL,
        command_on TEXT,
        command_off TEXT,
        gpio_pin INTEGER,
        relay_channel INTEGER,
        support_type TEXT NOT NULL DEFAULT 'unconfigured',
        confirmed_state TEXT NOT NULL DEFAULT 'off',
        pending_state TEXT,
        error_message TEXT,
        power_rating_watts REAL NOT NULL DEFAULT 60.0,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 5. Device Commands
    await this.run(`
      CREATE TABLE IF NOT EXISTS device_commands (
        id TEXT PRIMARY KEY,
        command_id TEXT UNIQUE NOT NULL,
        device_id TEXT NOT NULL REFERENCES devices(id),
        room_id TEXT NOT NULL REFERENCES rooms(id),
        controller_id TEXT NOT NULL REFERENCES controllers(id),
        action TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'PENDING',
        sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        acked_at DATETIME,
        error_message TEXT
      )
    `);

    // 6. Command Acknowledgements
    await this.run(`
      CREATE TABLE IF NOT EXISTS command_acknowledgements (
        id TEXT PRIMARY KEY,
        command_id TEXT NOT NULL REFERENCES device_commands(command_id),
        status TEXT NOT NULL,
        execution_time_ms INTEGER,
        raw_response TEXT,
        received_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 7. Telemetry Readings
    await this.run(`
      CREATE TABLE IF NOT EXISTS telemetry_readings (
        id TEXT PRIMARY KEY,
        controller_id TEXT NOT NULL REFERENCES controllers(id),
        voltage REAL,
        current REAL,
        power_watts REAL,
        energy_kwh REAL,
        temperature REAL,
        recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 8. Energy Readings
    await this.run(`
      CREATE TABLE IF NOT EXISTS energy_readings (
        id TEXT PRIMARY KEY,
        device_id TEXT NOT NULL REFERENCES devices(id),
        room_id TEXT NOT NULL REFERENCES rooms(id),
        date TEXT NOT NULL,
        hour INTEGER NOT NULL,
        energy_kwh REAL NOT NULL DEFAULT 0.0,
        operating_minutes REAL NOT NULL DEFAULT 0.0,
        cost REAL NOT NULL DEFAULT 0.0,
        recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 9. Schedules
    await this.run(`
      CREATE TABLE IF NOT EXISTS schedules (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        device_ids_json TEXT NOT NULL,
        action TEXT NOT NULL,
        time TEXT NOT NULL,
        end_time TEXT,
        repeat TEXT NOT NULL,
        days_json TEXT NOT NULL,
        start_date TEXT,
        end_date TEXT,
        enabled INTEGER NOT NULL DEFAULT 1,
        execution_scope TEXT NOT NULL DEFAULT 'server-scheduled',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 10. Schedule History
    await this.run(`
      CREATE TABLE IF NOT EXISTS schedule_history (
        id TEXT PRIMARY KEY,
        schedule_id TEXT NOT NULL REFERENCES schedules(id),
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT NOT NULL,
        device_count INTEGER,
        result_summary TEXT
      )
    `);

    // 11. Activity Logs
    await this.run(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        level TEXT NOT NULL,
        title TEXT NOT NULL,
        detail TEXT,
        is_hardware_confirmed INTEGER NOT NULL DEFAULT 0,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 12. System Settings
    await this.run(`
      CREATE TABLE IF NOT EXISTS system_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 13. Tariffs
    await this.run(`
      CREATE TABLE IF NOT EXISTS electricity_tariffs (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        rate_per_kwh REAL NOT NULL DEFAULT 8.0,
        currency TEXT NOT NULL DEFAULT 'INR',
        effective_from DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await this.seedDefaults();
    console.log('✅ SQLite database schema & seed initialized.');
  }

  private async seedDefaults(): Promise<void> {
    // 1. Controller: Single Central ESP32-WROOM-32
    const controller = await this.get('SELECT id FROM controllers WHERE id = ?', ['esp32-main-01']);
    if (!controller) {
      await this.run(`
        INSERT INTO controllers (id, name, mac_address, ip_address, firmware_version, status, last_heartbeat)
        VALUES ('esp32-main-01', 'Central House ESP32-WROOM-32', 'B4:E6:2D:E9:10:FA', '192.168.1.150', 'v1.0.0-esp32', 'offline', CURRENT_TIMESTAMP)
      `);
    }

    // 2. Default Rooms
    const roomsCount = await this.get<{ count: number }>('SELECT count(*) as count FROM rooms');
    if (roomsCount && roomsCount.count === 0) {
      const defaultRooms = [
        { id: 'living', name: 'Living Room', icon: 'Sofa', display_order: 1 },
        { id: 'bedroom', name: 'Bedroom', icon: 'BedDouble', display_order: 2 },
        { id: 'kitchen', name: 'Kitchen', icon: 'UtensilsCrossed', display_order: 3 },
        { id: 'bathroom', name: 'Bathroom', icon: 'Bath', display_order: 4 },
        { id: 'study', name: 'Study Room', icon: 'BookOpen', display_order: 5 },
        { id: 'outdoor', name: 'Outdoor', icon: 'TreePine', display_order: 6 },
      ];
      for (const r of defaultRooms) {
        await this.run(
          'INSERT INTO rooms (id, name, icon, display_order) VALUES (?, ?, ?, ?)',
          [r.id, r.name, r.icon, r.display_order]
        );
      }
    }

    // 3. Default Devices
    const devicesCount = await this.get<{ count: number }>('SELECT count(*) as count FROM devices');
    if (devicesCount && devicesCount.count === 0) {
      const defaultDevices = [
        // Lighting
        { id: 'light-1', name: 'Light 1', category: 'lighting', room_id: 'living', icon: 'Lightbulb', cmdOn: 'L1_ON', cmdOff: 'L1_OFF', pin: 18, support: 'supported', watts: 15 },
        { id: 'light-2', name: 'Light 2', category: 'lighting', room_id: 'bedroom', icon: 'Lightbulb', cmdOn: 'L2_ON', cmdOff: 'L2_OFF', pin: 19, support: 'supported', watts: 15 },
        { id: 'light-living', name: 'Living Room Light', category: 'lighting', room_id: 'living', icon: 'Lightbulb', cmdOn: 'L3_ON', cmdOff: 'L3_OFF', pin: 23, support: 'unconfigured', watts: 28 },
        { id: 'light-bedroom', name: 'Bedroom Light', category: 'lighting', room_id: 'bedroom', icon: 'Lightbulb', cmdOn: 'L4_ON', cmdOff: 'L4_OFF', pin: null, support: 'unconfigured', watts: 28 },
        { id: 'light-kitchen', name: 'Kitchen Light', category: 'lighting', room_id: 'kitchen', icon: 'Lightbulb', cmdOn: 'L5_ON', cmdOff: 'L5_OFF', pin: null, support: 'unconfigured', watts: 36 },
        { id: 'light-outdoor', name: 'Outdoor Light', category: 'lighting', room_id: 'outdoor', icon: 'Lightbulb', cmdOn: 'L6_ON', cmdOff: 'L6_OFF', pin: 25, support: 'unconfigured', watts: 50 },
        { id: 'light-study', name: 'Study Light', category: 'lighting', room_id: 'study', icon: 'Lightbulb', cmdOn: 'L7_ON', cmdOff: 'L7_OFF', pin: 26, support: 'unconfigured', watts: 22 },

        // Fans
        { id: 'fan-living', name: 'Living Room Fan', category: 'fan', room_id: 'living', icon: 'Wind', cmdOn: 'FAN1_ON', cmdOff: 'FAN1_OFF', pin: null, support: 'demo', watts: 65 },
        { id: 'fan-bedroom', name: 'Bedroom Fan', category: 'fan', room_id: 'bedroom', icon: 'Wind', cmdOn: 'FAN2_ON', cmdOff: 'FAN2_OFF', pin: null, support: 'demo', watts: 65 },
        { id: 'fan-ceiling-1', name: 'Ceiling Fan 1', category: 'fan', room_id: 'living', icon: 'Wind', cmdOn: 'FAN3_ON', cmdOff: 'FAN3_OFF', pin: null, support: 'demo', watts: 70 },

        // Climate
        { id: 'ac-bedroom', name: 'AC 1 — Bedroom', category: 'climate', room_id: 'bedroom', icon: 'Thermometer', cmdOn: 'AC1_ON', cmdOff: 'AC1_OFF', pin: null, support: 'demo', watts: 1500 },
        { id: 'ac-living', name: 'AC 2 — Living Room', category: 'climate', room_id: 'living', icon: 'Thermometer', cmdOn: 'AC2_ON', cmdOff: 'AC2_OFF', pin: null, support: 'demo', watts: 2200 },

        // Entertainment
        { id: 'tv-living', name: 'Living Room TV', category: 'entertainment', room_id: 'living', icon: 'Tv', cmdOn: 'TV1_ON', cmdOff: 'TV1_OFF', pin: null, support: 'demo', watts: 140 },
        { id: 'tv-bedroom', name: 'Bedroom TV', category: 'entertainment', room_id: 'bedroom', icon: 'Tv', cmdOn: 'TV2_ON', cmdOff: 'TV2_OFF', pin: null, support: 'demo', watts: 100 },

        // Water Heating
        { id: 'geyser-1', name: 'Geyser 1', category: 'water-heating', room_id: 'bathroom', icon: 'Flame', cmdOn: 'GEYSER1_ON', cmdOff: 'GEYSER1_OFF', pin: null, support: 'demo', watts: 2000 },
        { id: 'geyser-2', name: 'Geyser 2', category: 'water-heating', room_id: 'bathroom', icon: 'Flame', cmdOn: 'GEYSER2_ON', cmdOff: 'GEYSER2_OFF', pin: null, support: 'demo', watts: 2000 },

        // Outlets
        { id: 'outlet-study', name: 'Study Outlet', category: 'outlet', room_id: 'study', icon: 'Plug', cmdOn: 'OUT1_ON', cmdOff: 'OUT1_OFF', pin: 27, support: 'unconfigured', watts: 100 },
      ];

      for (const d of defaultDevices) {
        await this.run(`
          INSERT INTO devices (id, name, category, room_id, controller_id, icon, command_on, command_off, gpio_pin, support_type, confirmed_state, power_rating_watts)
          VALUES (?, ?, ?, ?, 'esp32-main-01', ?, ?, ?, ?, ?, 'off', ?)
        `, [d.id, d.name, d.category, d.room_id, d.icon, d.cmdOn, d.cmdOff, d.pin, d.support, d.watts]);
      }
    }

    // 4. Default Schedules
    const schedCount = await this.get<{ count: number }>('SELECT count(*) as count FROM schedules');
    if (schedCount && schedCount.count === 0) {
      await this.run(`
        INSERT INTO schedules (id, name, device_ids_json, action, time, repeat, days_json, enabled)
        VALUES ('sched-1', 'Bedroom Light — Evening ON', '["light-2"]', 'on', '19:00', 'daily', '[0,1,2,3,4,5,6]', 1)
      `);
      await this.run(`
        INSERT INTO schedules (id, name, device_ids_json, action, time, repeat, days_json, enabled)
        VALUES ('sched-2', 'All Lights — Night OFF', '["light-1","light-2","light-living","light-bedroom"]', 'off', '23:30', 'daily', '[0,1,2,3,4,5,6]', 1)
      `);
    }

    // 5. Initial Activity Log
    const actCount = await this.get<{ count: number }>('SELECT count(*) as count FROM activity_logs');
    if (actCount && actCount.count === 0) {
      await this.run(`
        INSERT INTO activity_logs (id, category, level, title, detail, is_hardware_confirmed)
        VALUES ('init-log', 'system', 'info', 'Centralized Smart Home Backend Initialized', 'Target controller: ESP32-WROOM-32', 1)
      `);
    }
  }
}

export const db = new Database();
