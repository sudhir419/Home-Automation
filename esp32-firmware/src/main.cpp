#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_MCP23017.h>
#include <DHT.h>

#include "config.h"
#include "hardware_map.h"

// Wi-Fi and MQTT Clients
WiFiClient espClient;
PubSubClient mqttClient(espClient);

// Peripherals
Adafruit_MCP23017 mcp;
bool hasMcpExpander = false;

#define DHTTYPE DHT22
DHT dht(PIN_DHT_SENSOR, DHTTYPE);

// Timers
unsigned long lastHeartbeatTime = 0;
unsigned long lastTelemetryTime = 0;

// Device table
ApplianceMapping deviceTable[] = {
    { "light-1",        PIN_RELAY_LIGHT1,  false, false },
    { "light-2",        PIN_RELAY_LIGHT2,  false, false },
    { "light-kitchen",  PIN_RELAY_KITCHEN, false, false },
    { "light-outdoor",  PIN_RELAY_OUTDOOR, false, false },
    { "light-study",    PIN_RELAY_STUDY,   false, false },
    { "outlet-study",   PIN_RELAY_OUTLET,  false, false },
    { "fan-living",     MCP_FAN_LIVING,    true,  false },
    { "fan-bedroom",    MCP_FAN_BEDROOM,   true,  false },
    { "fan-ceiling-1",  MCP_FAN_CEILING,   true,  false },
    { "ac-bedroom",     MCP_AC_BEDROOM,    true,  false },
    { "ac-living",      MCP_AC_LIVING,     true,  false },
    { "tv-living",      MCP_TV_LIVING,     true,  false },
    { "tv-bedroom",     MCP_TV_BEDROOM,    true,  false },
    { "geyser-1",       MCP_GEYSER_1,      true,  false },
    { "geyser-2",       MCP_GEYSER_2,      true,  false }
};
const int NUM_DEVICES = sizeof(deviceTable) / sizeof(deviceTable[0]);

// Function prototypes
void setupWiFi();
void reconnectMQTT();
void handleMQTTMessage(char* topic, byte* payload, unsigned int length);
void executeDeviceCommand(const char* cmdId, const char* devId, const char* action);
void sendHeartbeat();
void sendTelemetry();

void setup() {
    Serial.begin(115200);
    delay(500);
    Serial.println("\n==============================================");
    Serial.println("  ESP32-WROOM-32 CENTRAL SMART HOME CONTROLLER");
    Serial.println("  Firmware: " FIRMWARE_VERSION);
    Serial.println("==============================================");

    // 1. Initialize Direct GPIO Outputs
    pinMode(PIN_STATUS_LED, OUTPUT);
    digitalWrite(PIN_STATUS_LED, LOW);

    for (int i = 0; i < NUM_DEVICES; i++) {
        if (!deviceTable[i].isExpander) {
            pinMode(deviceTable[i].pin, OUTPUT);
            digitalWrite(deviceTable[i].pin, RELAY_INACTIVE_LEVEL);
            deviceTable[i].currentState = false;
        }
    }

    // 2. Initialize I2C Expander (MCP23017)
    Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL);
    if (mcp.begin()) {
        hasMcpExpander = true;
        Serial.println("✅ MCP23017 I/O Expander detected at 0x20");
        for (int i = 0; i < NUM_DEVICES; i++) {
            if (deviceTable[i].isExpander) {
                mcp.pinMode(deviceTable[i].pin, OUTPUT);
                mcp.digitalWrite(deviceTable[i].pin, RELAY_INACTIVE_LEVEL);
            }
        }
    } else {
        Serial.println("⚠️ MCP23017 not detected. Direct GPIO pins will operate normally.");
    }

    // 3. Initialize Sensors
    dht.begin();

    // 4. Connect to Wi-Fi & MQTT
    setupWiFi();
    mqttClient.setServer(MQTT_SERVER, MQTT_PORT);
    mqttClient.setCallback(handleMQTTMessage);
    mqttClient.setBufferSize(1024);
}

void loop() {
    if (WiFi.status() != WL_CONNECTED) {
        setupWiFi();
    }

    if (!mqttClient.connected()) {
        reconnectMQTT();
    }
    mqttClient.loop();

    unsigned long now = millis();

    // Heartbeat reporting
    if (now - lastHeartbeatTime >= HEARTBEAT_INTERVAL_MS) {
        lastHeartbeatTime = now;
        sendHeartbeat();
    }

    // Telemetry reporting
    if (now - lastTelemetryTime >= TELEMETRY_INTERVAL_MS) {
        lastTelemetryTime = now;
        sendTelemetry();
    }
}

void setupWiFi() {
    Serial.printf("\n[Wi-Fi] Connecting to %s...", WIFI_SSID);
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
        delay(500);
        Serial.print(".");
        digitalWrite(PIN_STATUS_LED, !digitalRead(PIN_STATUS_LED));
        attempts++;
    }

    if (WiFi.status() == WL_CONNECTED) {
        Serial.printf("\n[Wi-Fi] Connected! IP Address: %s | RSSI: %d dBm\n",
                      WiFi.localIP().toString().c_str(), WiFi.RSSI());
        digitalWrite(PIN_STATUS_LED, HIGH);
    } else {
        Serial.println("\n[Wi-Fi] Connection failed. Will retry in loop.");
        digitalWrite(PIN_STATUS_LED, LOW);
    }
}

void reconnectMQTT() {
    while (!mqttClient.connected()) {
        Serial.printf("[MQTT] Connecting to broker %s:%d as %s...", MQTT_SERVER, MQTT_PORT, CONTROLLER_ID);

        // LWT (Last Will and Testament) payload
        StaticJsonDocument<128> lwtDoc;
        lwtDoc["controllerId"] = CONTROLLER_ID;
        lwtDoc["status"] = "OFFLINE";
        char lwtBuffer[128];
        serializeJson(lwtDoc, lwtBuffer);

        if (mqttClient.connect(CONTROLLER_ID, MQTT_USER, MQTT_PASSWORD, TOPIC_STATUS, 1, true, lwtBuffer)) {
            Serial.println(" Connected!");
            mqttClient.subscribe(TOPIC_CMD);
            Serial.printf("[MQTT] Subscribed to topic: %s\n", TOPIC_CMD);

            // Announce Online Status
            StaticJsonDocument<128> onlineDoc;
            onlineDoc["controllerId"] = CONTROLLER_ID;
            onlineDoc["status"] = "ONLINE";
            char onlineBuffer[128];
            serializeJson(onlineDoc, onlineBuffer);
            mqttClient.publish(TOPIC_STATUS, onlineBuffer, true);
        } else {
            Serial.printf(" Failed (rc=%d). Retrying in 5 seconds...\n", mqttClient.state());
            delay(5000);
        }
    }
}

void handleMQTTMessage(char* topic, byte* payload, unsigned int length) {
    char messageBuffer[length + 1];
    memcpy(messageBuffer, payload, length);
    messageBuffer[length] = '\0';

    Serial.printf("[MQTT RX] %s -> %s\n", topic, messageBuffer);

    StaticJsonDocument<512> doc;
    DeserializationError error = deserializeJson(doc, messageBuffer);
    if (error) {
        Serial.printf("[JSON] Parse failed: %s\n", error.c_str());
        return;
    }

    const char* cmdId = doc["cmdId"] | "";
    const char* devId = doc["devId"] | "";
    const char* action = doc["action"] | "";

    executeDeviceCommand(cmdId, devId, action);
}

void executeDeviceCommand(const char* cmdId, const char* devId, const char* action) {
    unsigned long startTime = millis();
    bool found = false;
    bool targetState = (strcasecmp(action, "ON") == 0);

    for (int i = 0; i < NUM_DEVICES; i++) {
        if (strcmp(deviceTable[i].deviceId, devId) == 0) {
            found = true;
            int pinLevel = targetState ? RELAY_ACTIVE_LEVEL : RELAY_INACTIVE_LEVEL;

            if (deviceTable[i].isExpander) {
                if (hasMcpExpander) {
                    mcp.digitalWrite(deviceTable[i].pin, pinLevel);
                    deviceTable[i].currentState = targetState;
                } else {
                    Serial.println("[ERROR] Expander hardware not available");
                }
            } else {
                digitalWrite(deviceTable[i].pin, pinLevel);
                deviceTable[i].currentState = targetState;
            }

            unsigned long execMs = millis() - startTime;

            // Send Acknowledgment back to backend
            StaticJsonDocument<256> ackDoc;
            ackDoc["cmdId"] = cmdId;
            ackDoc["controllerId"] = CONTROLLER_ID;
            ackDoc["deviceId"] = devId;
            ackDoc["status"] = "SUCCESS";
            ackDoc["state"] = targetState ? "on" : "off";
            ackDoc["execMs"] = execMs;
            ackDoc["hardwarePin"] = deviceTable[i].pin;
            ackDoc["freeHeap"] = ESP.getFreeHeap();

            char ackBuffer[256];
            serializeJson(ackDoc, ackBuffer);
            mqttClient.publish(TOPIC_ACK, ackBuffer);

            Serial.printf("[ACK SENT] %s -> %s (%lu ms)\n", devId, targetState ? "ON" : "OFF", execMs);
            return;
        }
    }

    if (!found) {
        StaticJsonDocument<256> errorDoc;
        errorDoc["cmdId"] = cmdId;
        errorDoc["controllerId"] = CONTROLLER_ID;
        errorDoc["deviceId"] = devId;
        errorDoc["status"] = "ERROR";
        errorDoc["errorMessage"] = "Unknown device ID";

        char errBuffer[256];
        serializeJson(errorDoc, errBuffer);
        mqttClient.publish(TOPIC_ACK, errBuffer);
    }
}

void sendHeartbeat() {
    StaticJsonDocument<384> doc;
    doc["controllerId"] = CONTROLLER_ID;
    doc["status"] = "ONLINE";
    doc["wifiRssi"] = WiFi.RSSI();
    doc["ip"] = WiFi.localIP().toString();
    doc["uptimeSeconds"] = millis() / 1000;
    doc["freeHeapBytes"] = ESP.getFreeHeap();
    doc["firmwareVersion"] = FIRMWARE_VERSION;

    JsonArray activeRelays = doc.createNestedArray("activeRelays");
    for (int i = 0; i < NUM_DEVICES; i++) {
        if (deviceTable[i].currentState) {
            activeRelays.add(deviceTable[i].deviceId);
        }
    }

    char buffer[384];
    serializeJson(doc, buffer);
    mqttClient.publish(TOPIC_HEARTBEAT, buffer);
}

void sendTelemetry() {
    // Current & Power Measurement (Simulated baseline + CT sensor)
    int rawCT = analogRead(PIN_CT_SENSOR);
    float voltage = 230.0 + ((rawCT % 10) - 5) * 0.2; // ~230V Nominal AC
    float activeWatts = 0;

    for (int i = 0; i < NUM_DEVICES; i++) {
        if (deviceTable[i].currentState) {
            // Rough ratings for active devices
            if (strstr(deviceTable[i].deviceId, "light")) activeWatts += 15.0;
            else if (strstr(deviceTable[i].deviceId, "fan")) activeWatts += 65.0;
            else if (strstr(deviceTable[i].deviceId, "ac")) activeWatts += 1500.0;
            else if (strstr(deviceTable[i].deviceId, "tv")) activeWatts += 140.0;
            else if (strstr(deviceTable[i].deviceId, "geyser")) activeWatts += 2000.0;
            else activeWatts += 60.0;
        }
    }

    float current = (voltage > 0) ? (activeWatts / voltage) : 0.0;

    // Read Ambient Temperature & Humidity
    float tempC = dht.readTemperature();
    float hum = dht.readHumidity();
    if (isnan(tempC)) tempC = 26.5;
    if (isnan(hum)) hum = 50.0;

    StaticJsonDocument<256> doc;
    doc["controllerId"] = CONTROLLER_ID;
    doc["voltage"] = round(voltage * 10) / 10.0;
    doc["current"] = round(current * 100) / 100.0;
    doc["powerWatts"] = round(activeWatts * 10) / 10.0;
    doc["tempC"] = round(tempC * 10) / 10.0;
    doc["humidity"] = round(hum * 10) / 10.0;

    char buffer[256];
    serializeJson(doc, buffer);
    mqttClient.publish(TOPIC_TELEMETRY, buffer);
}
