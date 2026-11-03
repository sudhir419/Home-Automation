#ifndef HARDWARE_MAP_H
#define HARDWARE_MAP_H

#include <Arduino.h>

// ==============================================================================
// HARDWARE PIN ASSIGNMENTS — ESP32-WROOM-32 CENTRAL CONTROLLER
// ==============================================================================

// Relay driving logic (Most optocoupler relay boards are Active-LOW)
#define RELAY_ACTIVE_LEVEL   LOW
#define RELAY_INACTIVE_LEVEL HIGH

// Direct ESP32 Board GPIO Outputs
#define PIN_STATUS_LED       4   // Onboard/External Status LED
#define PIN_RELAY_LIGHT1     18  // Light 1 (Living Room)
#define PIN_RELAY_LIGHT2     19  // Light 2 (Bedroom)
#define PIN_I2C_SDA          21  // MCP23017 I2C SDA
#define PIN_I2C_SCL          22  // MCP23017 I2C SCL
#define PIN_RELAY_KITCHEN    23  // Kitchen Light
#define PIN_RELAY_OUTDOOR    25  // Outdoor Light
#define PIN_RELAY_STUDY      26  // Study Light
#define PIN_RELAY_OUTLET     27  // Study Outlet

// Analog & Sensor Inputs
#define PIN_CT_SENSOR        32  // Analog Current Transformer (ACS712 / CT)
#define PIN_DHT_SENSOR       33  // DHT22 Ambient Temperature & Humidity

// MCP23017 16-Channel I/O Expander Pin Mapping (I2C Address 0x20)
#define MCP_FAN_LIVING       0   // GPA0
#define MCP_FAN_BEDROOM      1   // GPA1
#define MCP_FAN_CEILING      2   // GPA2
#define MCP_AC_BEDROOM       3   // GPA3
#define MCP_AC_LIVING        4   // GPA4
#define MCP_TV_LIVING        5   // GPA5
#define MCP_TV_BEDROOM       6   // GPA6
#define MCP_GEYSER_1         7   // GPA7
#define MCP_GEYSER_2         8   // GPB0

struct ApplianceMapping {
    const char* deviceId;
    int pin;
    bool isExpander;
    bool currentState;
};

#endif // HARDWARE_MAP_H
