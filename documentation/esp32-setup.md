# ESP32-WROOM-32 Setup & Flashing Guide

## 1. Prerequisites
- **Microcontroller**: Standard ESP32-WROOM-32 (38-pin DevKit V1)
- **USB Cable**: Micro-USB with data transfer lines
- **Software**: Visual Studio Code with PlatformIO IDE extension (or Arduino IDE 2.x)
- **Drivers**: CP2102 or CH340 USB-to-UART bridge driver for macOS/Windows/Linux

---

## 2. Firmware Dependencies
The firmware project located in `esp32-firmware/` uses the following libraries:
- `PubSubClient` (v2.8) - MQTT client
- `ArduinoJson` (v7.0) - High efficiency JSON serialization
- `Adafruit MCP23017 Arduino Library` (v2.3) - 16-channel I/O expansion
- `DHT sensor library` (v1.4.6) - Ambient temperature & humidity monitoring

---

## 3. Configuration
Open `esp32-firmware/include/config.h` and specify your local network credentials:

```cpp
#define WIFI_SSID        "Your_WiFi_Name"
#define WIFI_PASSWORD    "Your_WiFi_Password"
#define MQTT_SERVER      "192.168.1.100" // IP address of backend machine
#define MQTT_PORT        1883
#define MQTT_USER        "esp32_client"
#define MQTT_PASSWORD    "secret_esp32_pwd"
#define CONTROLLER_ID    "esp32-main-01"
```

---

## 4. Flashing Instructions (PlatformIO)
1. Open the project root in VS Code.
2. Navigate to `esp32-firmware/`.
3. Connect the ESP32 to your computer.
4. Run:
   ```bash
   cd esp32-firmware
   pio run --target upload
   pio device monitor -b 115200
   ```
5. Observe the Serial Monitor:
   - Wi-Fi connecting... Connected! IP: `192.168.1.150`
   - Connecting to MQTT Broker... Connected!
   - Subscribed to `home/esp32/cmd`
   - Heartbeat sent: `home/esp32/heartbeat`
