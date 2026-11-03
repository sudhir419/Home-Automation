# Database Architecture & Entity Specifications

The backend uses a normalized relational schema with SQLite for simple zero-dependency local development and direct migration paths to PostgreSQL for enterprise production.

```sql
-- 1. USERS & CREDENTIALS
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin', -- 'admin', 'resident', 'guest'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. ESP32 CONTROLLERS
CREATE TABLE IF NOT EXISTS controllers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    mac_address TEXT UNIQUE,
    ip_address TEXT,
    firmware_version TEXT,
    status TEXT NOT NULL DEFAULT 'offline', -- 'online', 'offline', 'error'
    last_heartbeat DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. ROOMS
CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. DEVICES
CREATE TABLE IF NOT EXISTS devices (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'lighting', 'fan', 'climate', 'entertainment', 'water-heating', 'outlet', 'other'
    room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    controller_id TEXT NOT NULL REFERENCES controllers(id) ON DELETE RESTRICT,
    icon TEXT NOT NULL,
    command_on TEXT,
    command_off TEXT,
    gpio_pin INTEGER,
    relay_channel INTEGER,
    support_type TEXT NOT NULL DEFAULT 'unconfigured', -- 'supported', 'unconfigured', 'demo'
    confirmed_state TEXT NOT NULL DEFAULT 'off', -- 'on', 'off', 'unknown', 'error', 'disconnected'
    pending_state TEXT,
    error_message TEXT,
    power_rating_watts REAL NOT NULL DEFAULT 60.0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. DEVICE COMMANDS
CREATE TABLE IF NOT EXISTS device_commands (
    id TEXT PRIMARY KEY,
    command_id TEXT UNIQUE NOT NULL,
    device_id TEXT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    room_id TEXT NOT NULL REFERENCES rooms(id),
    controller_id TEXT NOT NULL REFERENCES controllers(id),
    action TEXT NOT NULL, -- 'ON', 'OFF'
    status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'SENT', 'ACKNOWLEDGED', 'FAILED', 'TIMED_OUT'
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    acked_at DATETIME,
    error_message TEXT
);

-- 6. COMMAND ACKNOWLEDGEMENTS
CREATE TABLE IF NOT EXISTS command_acknowledgements (
    id TEXT PRIMARY KEY,
    command_id TEXT NOT NULL REFERENCES device_commands(command_id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    execution_time_ms INTEGER,
    raw_response TEXT,
    received_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. TELEMETRY READINGS
CREATE TABLE IF NOT EXISTS telemetry_readings (
    id TEXT PRIMARY KEY,
    controller_id TEXT NOT NULL REFERENCES controllers(id),
    voltage REAL,
    current REAL,
    power_watts REAL,
    energy_kwh REAL,
    temperature REAL,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. ENERGY CONSUMPTION SUMMARY
CREATE TABLE IF NOT EXISTS energy_readings (
    id TEXT PRIMARY KEY,
    device_id TEXT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    room_id TEXT NOT NULL REFERENCES rooms(id),
    date TEXT NOT NULL, -- YYYY-MM-DD
    hour INTEGER NOT NULL, -- 0-23
    energy_kwh REAL NOT NULL DEFAULT 0.0,
    operating_minutes REAL NOT NULL DEFAULT 0.0,
    cost REAL NOT NULL DEFAULT 0.0,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. SCHEDULES
CREATE TABLE IF NOT EXISTS schedules (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    device_ids_json TEXT NOT NULL, -- JSON array of string deviceIds
    action TEXT NOT NULL, -- 'on', 'off'
    time TEXT NOT NULL, -- HH:mm
    end_time TEXT,
    repeat TEXT NOT NULL, -- 'once', 'daily', 'weekly', 'weekdays', 'weekends'
    days_json TEXT NOT NULL, -- JSON array of day numbers [0..6]
    start_date TEXT,
    end_date TEXT,
    enabled INTEGER NOT NULL DEFAULT 1,
    execution_scope TEXT NOT NULL DEFAULT 'server-scheduled',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 10. SCHEDULE EXECUTION HISTORY
CREATE TABLE IF NOT EXISTS schedule_history (
    id TEXT PRIMARY KEY,
    schedule_id TEXT NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL, -- 'SUCCESS', 'PARTIAL', 'FAILED'
    device_count INTEGER,
    result_summary TEXT
);

-- 11. ACTIVITY & EVENT LOGS
CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL, -- 'bluetooth', 'device', 'schedule', 'system'
    level TEXT NOT NULL, -- 'info', 'success', 'warning', 'error'
    title TEXT NOT NULL,
    detail TEXT,
    is_hardware_confirmed INTEGER NOT NULL DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 12. SYSTEM SETTINGS
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 13. ELECTRICITY TARIFFS
CREATE TABLE IF NOT EXISTS electricity_tariffs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    rate_per_kwh REAL NOT NULL DEFAULT 8.0,
    currency TEXT NOT NULL DEFAULT 'INR',
    effective_from DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR FAST ANALYTICS
CREATE INDEX IF NOT EXISTS idx_devices_room ON devices(room_id);
CREATE INDEX IF NOT EXISTS idx_energy_date ON energy_readings(date, hour);
CREATE INDEX IF NOT EXISTS idx_commands_time ON device_commands(sent_at);
CREATE INDEX IF NOT EXISTS idx_activity_time ON activity_logs(timestamp);
```
