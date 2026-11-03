# Hardware Mapping — Single ESP32-WROOM-32 Controller

## 1. Physical Hardware Constraints & Pin Assignments
The **ESP32-WROOM-32** controller is equipped with 38 pins. Certain pins are strapped for boot configuration (GPIO 0, 2, 5, 12, 15) or reserved for SPI flash (GPIO 6-11) and ADC2 (which conflicts with Wi-Fi).

To reliably actuate 17+ devices across 6 rooms without reboot loops or voltage brownouts, the hardware mapping is segregated into **Direct Isolated GPIO Channels** and **I2C Bus Expansion Channels**.

```
+------------------------------------------------------------------------+
|               ESP32-WROOM-32 DIRECT BOARD PIN CONFIGURATION             |
+------------+--------------------+----------------+---------------------+
| GPIO Pin   | Default Function   | Assigned Device| Room Assignment     |
+------------+--------------------+----------------+---------------------+
| GPIO 18    | Output (Relay 1)   | light-1        | Living Room Main    |
| GPIO 19    | Output (Relay 2)   | light-2        | Bedroom Main        |
| GPIO 21    | I2C SDA            | MCP23017 SDA   | System Bus          |
| GPIO 22    | I2C SCL            | MCP23017 SCL   | System Bus          |
| GPIO 23    | Output (Relay 3)   | light-kitchen  | Kitchen Main Light  |
| GPIO 25    | Output (Relay 4)   | light-outdoor  | Outdoor Floodlight  |
| GPIO 26    | Output (Relay 5)   | light-study    | Study Room Light    |
| GPIO 27    | Output (Relay 6)   | outlet-study   | Study Wall Outlet   |
| GPIO 32    | ADC1 (CT Sensor)   | ACS712 / CT    | Total Current Meter |
| GPIO 33    | Digital 1-Wire     | DHT22 / AM2302 | Ambient Temp/Hum    |
| GPIO 4     | Status LED         | System Status  | Hardware Heartbeat  |
+------------+--------------------+----------------+---------------------+
```

---

## 2. I2C 16-Bit I/O Expander (MCP23017 at Address 0x20)
For high-density room appliances (Fans, ACs, Entertainment consoles, Geysers), an MCP23017 expander on the I2C bus drives an 8-channel or 16-channel optically isolated relay board.

```
+-----------+--------------------+------------------+--------------------+
| MCP Pin   | Relay Board Ch.    | Assigned Device  | Room Assignment    |
+-----------+--------------------+------------------+--------------------+
| GPA0      | Relay Channel 1    | fan-living       | Living Room Fan    |
| GPA1      | Relay Channel 2    | fan-bedroom      | Bedroom Fan        |
| GPA2      | Relay Channel 3    | fan-ceiling-1    | Living Ceiling Fan |
| GPA3      | Relay Channel 4    | ac-bedroom       | Bedroom AC (Relay) |
| GPA4      | Relay Channel 5    | ac-living        | Living AC (Relay)  |
| GPA5      | Relay Channel 6    | tv-living        | Living TV Power    |
| GPA6      | Relay Channel 7    | tv-bedroom       | Bedroom TV Power   |
| GPA7      | Relay Channel 8    | geyser-1         | Bathroom Geyser 1  |
| GPB0      | Relay Channel 9    | geyser-2         | Bathroom Geyser 2  |
+-----------+--------------------+------------------+--------------------+
```

> **CRITICAL ELECTRICAL SAFETY REQUIREMENT**:
> 1. Never connect 110V/230V AC mains electricity directly to any pin of the ESP32 or MCP23017.
> 2. Relays must be rated for at least 10A / 250VAC with optocoupler isolation (JD-VCC jumper disconnected from VCC and powered via a dedicated external 5V 2A supply).
> 3. For water geysers and high-tonnage AC compressors (>1500W), interpose a 25A/32A Heavy-Duty AC Contactor driven by the relay output.
