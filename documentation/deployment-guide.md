# End-to-End System Deployment Guide

## 1. Architecture Components
1. **Frontend**: Vite + React 19 + TypeScript (Port 5173 / Production Web Server)
2. **Backend**: Express + TypeScript + SQLite/PostgreSQL + WebSockets (Port 5001)
3. **MQTT Broker**: Eclipse Mosquitto or Aedes internal broker (Port 1883)
4. **Hardware**: Single ESP32-WROOM-32 connected to local Wi-Fi

---

## 2. Installation & Quick Start

### Step 1: Install & Launch Backend
```bash
cd backend
npm install
npm run build
npm start
```
The backend initializes the SQLite database schema (`home_automation.db`), starts the embedded MQTT broker on port 1883, launches the HTTP REST API on port 5001, and binds the WebSocket server on `ws://0.0.0.0:5001/ws`.

### Step 2: Flash ESP32-WROOM-32 Controller
1. Configure `WIFI_SSID`, `WIFI_PASSWORD`, and `MQTT_SERVER` (your computer's local IP address) in `esp32-firmware/include/config.h`.
2. Connect ESP32 via USB and upload with PlatformIO (`pio run --target upload`) or Arduino IDE.
3. The ESP32 joins the local network and registers with the backend automatically via MQTT heartbeat.

### Step 3: Run Frontend
```bash
# In the project root directory:
npm run dev -- --host 0.0.0.0
```
Open `http://localhost:5173/` in your browser.

---

## 3. Operational Modes
- **Real Hardware Mode**: Toggle switch in Settings. Commands are sent to `POST /api/devices/:id/control`, relayed via MQTT to ESP32, and physical relays click on/off with sub-50ms latency.
- **Demo Mode**: Allows complete testing of 3D animations, charts, and device toggles without requiring physical ESP32 hardware attached.
