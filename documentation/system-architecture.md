# System Architecture — Centralized ESP32-WROOM-32 Smart Home System

## 1. Architectural Overview

The Smart Home Automation and Energy Management System operates on a **hub-and-spoke centralized architecture** where a single **ESP32-WROOM-32** microcontroller interfaces all physical appliances throughout the home, mediated by a high-performance **Node.js/TypeScript backend** with real-time **MQTT** and **WebSocket** links to the modern **React 19** frontend.

```
+-------------------------------------------------------------------------+
|                              USER CLIENTS                               |
|   Web Browser (Desktop / Mobile) / Android WebApp (Capacitor Native)    |
|   - 3D Interactive Residence & Solar Appliance Showcase (Three.js)      |
|   - Room-Wise Controls, Lighting, Climate, Entertainment Dashboards     |
|   - Real-Time Electricity Analytics (Hourly, Daily, Monthly, Tariffs)   |
|   - Scheduling Engine, System Logs & Bluetooth Pairing UI               |
+------------------------------------+------------------------------------+
                                     |
                       HTTP / REST   |   WebSocket (ws / JSON)
                                     v
+------------------------------------+------------------------------------+
|                      CENTRALIZED BACKEND SERVER                         |
|                      (Node.js + TypeScript + Express)                   |
|                                                                         |
|  +--------------------+  +--------------------+  +-------------------+  |
|  | REST API Router    |  | WebSocket Hub      |  | Cron Scheduler    |  |
|  | (Auth, Rooms, Dev) |  | (Live Telemetry)   |  | (Hardware Sync)   |  |
|  +--------------------+  +--------------------+  +-------------------+  |
|  +--------------------+  +--------------------+  +-------------------+  |
|  | MQTT Client Engine |  | Energy Analytics   |  | Activity Logger   |  |
|  | (QoS 1, ACK Valid) |  | (Watt/kWh Records) |  | (Audit Trails)    |  |
|  +--------------------+  +--------------------+  +-------------------+  |
|                                                                         |
|  Database Engine: SQLite (Local Zero-Config) / PostgreSQL (Production)  |
+------------------------------------+------------------------------------+
                                     |
                         MQTT Broker (Mosquitto / HiveMQ)
                         Topics: home/esp32/commands, home/esp32/telemetry
                                     v
+------------------------------------+------------------------------------+
|                   SINGLE ESP32-WROOM-32 CONTROLLER                      |
|                     (Central Master Controller)                         |
|                                                                         |
|  - FreeRTOS Dual Core Architecture (Core 0: Network / Core 1: Hardware)|
|  - Wi-Fi 802.11 b/g/n + MQTT Client (Auto-reconnection & Watchdog)     |
|  - Bluetooth Classic (SPP) / BLE Coexistence for local commission      |
|  - GPIO Direct Relay Drives (Optocoupler-isolated relays for lights)   |
|  - I2C I/O Expansion (MCP23017: 16 channels for 6 rooms expansion)    |
|  - Hardware Monitoring: V/I CT sensors (ACS712 / PZEM-004T), DHT22     |
+-------------------------------------------------------------------------+
```

---

## 2. Communication Protocols & Data Flow

### A. Device Control Flow (Frontend -> Hardware -> Confirmation)
1. **User Action**: User toggles an appliance switch on the frontend interface.
2. **REST / WS Request**: Frontend dispatches `POST /api/devices/:id/control` with `{ action: 'on' | 'off' }`.
3. **Validation**: Backend checks device registration, room ownership, and controller status.
4. **Command Record**: An unconfirmed command record is created with a unique UUID.
5. **MQTT Publish**: Backend publishes payload to `home/esp32/cmd`:
   ```json
   {
     "cmdId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
     "devId": "light-1",
     "action": "ON",
     "pin": 18,
     "timestamp": 1793540000000
   }
   ```
6. **Execution**: The ESP32 receives the message, parses the payload, validates pin safety, toggles the hardware relay, and verifies GPIO logic.
7. **Acknowledgement**: ESP32 publishes execution ACK to `home/esp32/ack`:
   ```json
   {
     "cmdId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
     "devId": "light-1",
     "status": "SUCCESS",
     "state": "ON",
     "execMs": 4
   }
   ```
8. **Store & Broadcast**: Backend marks command confirmed in DB, logs activity with `isHardwareConfirmed: true`, and broadcasts `DEVICE_STATE_CHANGE` via WebSocket to all connected browser clients.

### B. Telemetry & Energy Monitoring Flow
1. ESP32 monitors current transformer (CT) sensor or energy metering IC (PZEM-004T / ADE7953) on an interrupt/periodic timer.
2. Telemetry is batched and published every 5 seconds to `home/esp32/telemetry`:
   ```json
   {
     "controllerId": "esp32-main-01",
     "voltage": 230.4,
     "totalCurrent": 4.12,
     "powerWatts": 949.2,
     "energyTotalKWh": 142.85,
     "tempC": 27.5,
     "uptimeSec": 86400
   }
   ```
3. Backend ingests telemetry, updates current power curves, calculates hourly and daily kWh aggregations, updates estimated tariffs (₹8/kWh), and emits live telemetry updates to the frontend dashboard.

---

## 3. Hardware Scaling & Abstraction for Single ESP32-WROOM-32

The ESP32-WROOM-32 development board provides 38 pins with approximately 25 usable General Purpose Input/Output (GPIO) pins. To control **17+ appliances across 6 rooms** with a single microcontroller, the system employs **Modular Hardware Abstraction Layers (HAL)**:

1. **Direct GPIO Pinout (Primary High-Frequency Relays)**:
   - `GPIO 18`: Light 1 (Living Room Main Light)
   - `GPIO 19`: Light 2 (Bedroom Main Light)
   - `GPIO 21`: Kitchen Light
   - `GPIO 22`: Outdoor Security Light
   - `GPIO 23`: Study Room Light

2. **I2C Bus Expansion (MCP23017 16-Bit I/O Expander)**:
   - Controlled via `SDA (GPIO 21)` and `SCL (GPIO 22)`.
   - Extends the ESP32 by 16 additional isolated relay/transistor channels for Fans, Air Conditioners, TVs, and auxiliary outlets.

3. **Optically Isolated Relay Modules**:
   - All AC mains loads are triggered through 5V/12V optically isolated multi-channel relay modules (PC817 optocouplers, flyback diodes, and separate VCC power rail) to guarantee zero electrical interference or reverse voltage spikes back to the ESP32.
