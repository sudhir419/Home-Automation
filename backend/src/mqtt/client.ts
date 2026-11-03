import mqtt from 'mqtt';
import { config } from '../config/index.js';
import { db } from '../database/index.js';
import { wsHub } from '../websocket/server.js';

export class MQTTClientManager {
  private client: mqtt.MqttClient | null = null;
  private pendingCommands: Map<string, {
    resolve: (ack: any) => void;
    reject: (err: any) => void;
    timer: NodeJS.Timeout;
  }> = new Map();

  public init(): Promise<void> {
    return new Promise((resolve) => {
      console.log(`📡 Connecting to MQTT Broker at: ${config.mqttBrokerUrl}...`);
      this.client = mqtt.connect(config.mqttBrokerUrl, {
        clientId: 'backend-server-' + Math.random().toString(16).substring(2, 8),
        clean: true,
        connectTimeout: 5000,
        reconnectPeriod: 3000,
      });

      this.client.on('connect', () => {
        console.log('✅ MQTT Client successfully connected to broker');
        this.client?.subscribe([
          'home/esp32/ack',
          'home/esp32/heartbeat',
          'home/esp32/telemetry',
          'home/esp32/status',
        ], (err) => {
          if (err) console.error('Subscription error:', err);
          else console.log('✅ Subscribed to ESP32 topics (ack, heartbeat, telemetry, status)');
        });
        resolve();
      });

      this.client.on('message', (topic, payload) => {
        this.handleMessage(topic, payload.toString());
      });

      this.client.on('error', (err) => {
        console.error('MQTT Client Error:', err.message);
      });
    });
  }

  private async handleMessage(topic: string, messageStr: string) {
    try {
      const data = JSON.parse(messageStr);

      if (topic === 'home/esp32/ack') {
        const { cmdId, deviceId, status, state, execMs } = data;
        console.log(`📥 [ACK RECEIVED] Device: ${deviceId} | State: ${state} | Execution: ${execMs}ms`);

        // 1. Update database device record
        if (status === 'SUCCESS') {
          await db.run(
            'UPDATE devices SET confirmed_state = ?, pending_state = NULL, error_message = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [state, deviceId]
          );

          // 2. Update device command status
          await db.run(
            'UPDATE device_commands SET status = ?, acked_at = CURRENT_TIMESTAMP WHERE command_id = ?',
            ['ACKNOWLEDGED', cmdId]
          );

          // 3. Insert acknowledgment record
          await db.run(
            'INSERT INTO command_acknowledgements (id, command_id, status, execution_time_ms, raw_response) VALUES (?, ?, ?, ?, ?)',
            [`ack-${Date.now()}`, cmdId, status, execMs || 0, messageStr]
          );

          // 4. Log Activity
          await db.run(
            'INSERT INTO activity_logs (id, category, level, title, detail, is_hardware_confirmed) VALUES (?, ?, ?, ?, ?, ?)',
            [`act-${Date.now()}`, 'device', 'success', `Hardware ACK: ${deviceId.toUpperCase()} -> ${state.toUpperCase()}`, `Executed on ESP32 in ${execMs || 0}ms`, 1]
          );

          // 5. Broadcast to all WebSocket clients
          wsHub.broadcast({
            type: 'DEVICE_STATE_CHANGE',
            deviceId,
            state,
            isHardwareConfirmed: true,
            executionTimeMs: execMs,
          });
        }

        // Resolve pending promise if waiting
        if (cmdId && this.pendingCommands.has(cmdId)) {
          const pending = this.pendingCommands.get(cmdId)!;
          clearTimeout(pending.timer);
          this.pendingCommands.delete(cmdId);
          pending.resolve(data);
        }
      }

      else if (topic === 'home/esp32/heartbeat') {
        const { controllerId, wifiRssi, ip, uptimeSeconds, freeHeapBytes } = data;
        await db.run(
          'UPDATE controllers SET status = ?, ip_address = ?, last_heartbeat = CURRENT_TIMESTAMP WHERE id = ?',
          ['online', ip, controllerId]
        );

        wsHub.broadcast({
          type: 'CONTROLLER_HEARTBEAT',
          controllerId,
          status: 'online',
          wifiRssi,
          ip,
          uptimeSeconds,
          freeHeapBytes,
        });
      }

      else if (topic === 'home/esp32/telemetry') {
        const { controllerId, voltage, current, powerWatts, tempC, humidity } = data;
        await db.run(
          'INSERT INTO telemetry_readings (id, controller_id, voltage, current, power_watts, temperature) VALUES (?, ?, ?, ?, ?, ?)',
          [`telem-${Date.now()}`, controllerId, voltage, current, powerWatts, tempC]
        );

        wsHub.broadcast({
          type: 'TELEMETRY_UPDATE',
          controllerId,
          voltage,
          current,
          powerWatts,
          tempC,
          humidity,
        });
      }

      else if (topic === 'home/esp32/status') {
        const { controllerId, status } = data;
        await db.run(
          'UPDATE controllers SET status = ? WHERE id = ?',
          [status === 'ONLINE' ? 'online' : 'offline', controllerId]
        );

        wsHub.broadcast({
          type: 'CONTROLLER_STATUS',
          controllerId,
          status: status === 'ONLINE' ? 'online' : 'offline',
        });
      }
    } catch (err: any) {
      console.error('Error handling MQTT message:', err);
    }
  }

  public publishCommand(cmdId: string, deviceId: string, action: string, pin: number | null): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.client || !this.client.connected) {
        return reject(new Error('MQTT client is not connected to broker.'));
      }

      const payload = JSON.stringify({
        cmdId,
        controllerId: 'esp32-main-01',
        devId: deviceId,
        action: action.toUpperCase(),
        pin: pin || 0,
        timestamp: Date.now(),
      });

      // 5-second timeout waiting for hardware ACK
      const timer = setTimeout(() => {
        if (this.pendingCommands.has(cmdId)) {
          this.pendingCommands.delete(cmdId);
          reject(new Error(`Hardware ACK timeout for device ${deviceId} (ESP32 did not respond in 5000ms)`));
        }
      }, 5000);

      this.pendingCommands.set(cmdId, { resolve, reject, timer });

      this.client.publish('home/esp32/cmd', payload, { qos: 1 }, (err) => {
        if (err) {
          clearTimeout(timer);
          this.pendingCommands.delete(cmdId);
          reject(err);
        } else {
          console.log(`📤 [COMMAND SENT] ${deviceId} -> ${action} (cmdId: ${cmdId})`);
        }
      });
    });
  }
}

export const mqttManager = new MQTTClientManager();
