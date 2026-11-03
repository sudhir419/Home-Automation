#ifndef CONFIG_H
#define CONFIG_H

// ==============================================================================
// ESP32-WROOM-32 HARDWARE & NETWORK CONFIGURATION
// ==============================================================================

// Wi-Fi Credentials
#define WIFI_SSID           "Home_WiFi_2.4G"
#define WIFI_PASSWORD       "SecretPassword123"

// Central MQTT Broker Configuration
// (Set this to the IP address of the machine running the Node.js backend)
#define MQTT_SERVER         "192.168.1.100"
#define MQTT_PORT           1883
#define MQTT_USER           "esp32_device"
#define MQTT_PASSWORD       "esp32_secret"

// Device Identity
#define CONTROLLER_ID       "esp32-main-01"
#define FIRMWARE_VERSION    "v1.0.0-esp32"

// MQTT Topics
#define TOPIC_CMD           "home/esp32/cmd"
#define TOPIC_ACK           "home/esp32/ack"
#define TOPIC_HEARTBEAT     "home/esp32/heartbeat"
#define TOPIC_TELEMETRY     "home/esp32/telemetry"
#define TOPIC_STATUS        "home/esp32/status"

// Reporting Intervals (milliseconds)
#define HEARTBEAT_INTERVAL_MS 15000
#define TELEMETRY_INTERVAL_MS 5000

#endif // CONFIG_H
