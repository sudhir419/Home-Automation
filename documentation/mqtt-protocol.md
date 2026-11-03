# MQTT Communication Protocol — Single ESP32-WROOM-32

## 1. Broker Configuration
- **Default Port**: 1883 (TCP Plaintext) / 8883 (TLS / MQTTS) / 9001 (WebSockets)
- **Base Topic Hierarchy**: `home/esp32/`
- **Quality of Service (QoS)**: QoS 1 (At least once) for all commands and acknowledgements.
- **Client Identifiers**:
  - Backend: `home-auto-backend-server`
  - ESP32 Hardware: `esp32-wroom32-master`

---

## 2. Topics & Payloads

### Topic: `home/esp32/cmd`
**Direction**: Backend -> ESP32 Controller
**Purpose**: Issues an appliance actuation command to the physical controller.

```json
{
  "cmdId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "controllerId": "esp32-main-01",
  "deviceId": "light-1",
  "roomId": "living",
  "action": "ON",
  "pin": 18,
  "isExpander": false,
  "timestamp": 1793540000000
}
```

### Topic: `home/esp32/ack`
**Direction**: ESP32 Controller -> Backend
**Purpose**: Confirm hardware state change and report execution duration in milliseconds.

```json
{
  "cmdId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "controllerId": "esp32-main-01",
  "deviceId": "light-1",
  "status": "SUCCESS",
  "state": "ON",
  "execMs": 4,
  "hardwarePin": 18,
  "freeHeap": 183420,
  "timestamp": 1793540000050
}
```

### Topic: `home/esp32/heartbeat`
**Direction**: ESP32 Controller -> Backend
**Frequency**: Every 15 seconds.
**Purpose**: Health monitoring, link keep-alive, and memory leak detection.

```json
{
  "controllerId": "esp32-main-01",
  "status": "ONLINE",
  "wifiRssi": -58,
  "ip": "192.168.1.150",
  "uptimeSeconds": 14200,
  "freeHeapBytes": 194820,
  "activeRelays": ["light-1", "light-2"],
  "firmwareVersion": "v1.0.0-esp32"
}
```

### Topic: `home/esp32/telemetry`
**Direction**: ESP32 Controller -> Backend
**Frequency**: Every 5 seconds.
**Purpose**: Voltage, current, real-time wattage, accumulated kWh, and ambient temperature.

```json
{
  "controllerId": "esp32-main-01",
  "voltage": 230.2,
  "current": 3.85,
  "powerWatts": 886.27,
  "energyKWh": 24.12,
  "tempC": 26.8,
  "humidity": 52.4,
  "timestamp": 1793540000000
}
```

### Topic: `home/esp32/lwt` (Last Will & Testament)
**Configured during MQTT CONNECT**:
- Topic: `home/esp32/status`
- Payload: `{"controllerId":"esp32-main-01","status":"OFFLINE","reason":"UNEXPECTED_DISCONNECT"}`
- Retain: true, QoS: 1
