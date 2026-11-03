# REST API & WebSocket Documentation

Base URL: `http://localhost:5001/api`
WebSocket Endpoint: `ws://localhost:5001/ws`

## 1. Authentication Endpoints

### `POST /api/auth/login`
- **Request**:
  ```json
  { "username": "admin", "password": "password123" }
  ```
- **Response** (200 OK):
  ```json
  {
    "token": "jwt_token_sample",
    "user": { "id": "u1", "username": "admin", "role": "admin" }
  }
  ```

### `GET /api/auth/me`
Returns the currently authenticated user session.

---

## 2. Controller & Hardware Endpoints

### `GET /api/controllers`
Lists registered ESP32 controllers.
- **Response** (200 OK):
  ```json
  [
    {
      "id": "esp32-main-01",
      "name": "Central House ESP32-WROOM-32",
      "macAddress": "B4:E6:2D:E9:10:FA",
      "ipAddress": "192.168.1.150",
      "status": "online",
      "firmwareVersion": "v1.0.0-esp32",
      "lastHeartbeat": "2026-11-02T16:30:00.000Z"
    }
  ]
  ```

### `GET /api/controllers/:id/status`
Returns real-time health, memory, and telemetry of the master ESP32.

---

## 3. Rooms & Devices Endpoints

### `GET /api/rooms`
Returns all 6 registered rooms and their assigned device IDs.

### `GET /api/devices`
Returns all devices with their real confirmed states and pin mappings.

### `POST /api/devices/:id/control`
Executes an ON/OFF command through the ESP32.
- **Request**:
  ```json
  {
    "action": "on",
    "demoMode": false
  }
  ```
- **Response** (200 OK when ACK received):
  ```json
  {
    "success": true,
    "deviceId": "light-1",
    "confirmedState": "on",
    "hardwareConfirmed": true,
    "executionTimeMs": 6,
    "message": "Relay GPIO 18 set to HIGH on ESP32-WROOM-32"
  }
  ```

---

## 4. Electricity & Energy Analytics Endpoints

### `GET /api/electricity/summary?filter=today`
Returns energy consumption, operating hours, load breakdown, and estimated costs.
- **Response** (200 OK):
  ```json
  {
    "totalKWh": 6.84,
    "totalCost": 54.72,
    "activeWatts": 1280.0,
    "hourlyCurve": [ { "hour": 0, "kWh": 0.22, "watts": 220 }, ... ],
    "roomBreakdown": [ { "roomId": "living", "kWh": 2.45, "percentage": 35.8 }, ... ],
    "categoryBreakdown": [ { "category": "lighting", "kWh": 1.2, "percentage": 17.5 }, ... ]
  }
  ```

### `GET /api/electricity/device/:id`
Returns session history and cumulative kWh for a specific device.

---

## 5. Schedules Endpoints

### `GET /api/schedules`
Lists all active automation schedules.

### `POST /api/schedules`
Creates a new automated schedule.

### `PUT /api/schedules/:id`
Updates time, days, or enabled status.

### `DELETE /api/schedules/:id`
Deletes an automation schedule.

---

## 6. Activity & Logs Endpoints

### `GET /api/activity`
Returns system audit events, hardware state changes, and MQTT confirmations.

### `DELETE /api/activity`
Clears activity logs.

---

## 7. WebSocket Live Events

Connecting to `ws://localhost:5001/ws` provides real-time bidirectional streaming:

### Outgoing Events from Server:
1. `DEVICE_STATE_CHANGE`:
   ```json
   {
     "type": "DEVICE_STATE_CHANGE",
     "deviceId": "light-1",
     "state": "on",
     "isHardwareConfirmed": true,
     "timestamp": "2026-11-02T16:32:00.000Z"
   }
   ```
2. `CONTROLLER_HEARTBEAT`:
   ```json
   {
     "type": "CONTROLLER_HEARTBEAT",
     "controllerId": "esp32-main-01",
     "status": "online",
     "freeHeap": 194820
   }
   ```
3. `TELEMETRY_UPDATE`:
   ```json
   {
     "type": "TELEMETRY_UPDATE",
     "voltage": 230.1,
     "watts": 850.4,
     "totalKWh": 24.15
   }
   ```
4. `SCHEDULE_TRIGGERED`:
   ```json
   {
     "type": "SCHEDULE_TRIGGERED",
     "scheduleId": "sched-1",
     "status": "SUCCESS"
   }
   ```
