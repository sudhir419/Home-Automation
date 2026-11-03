import { db } from '../database/index.js';
import { mqttManager } from '../mqtt/client.js';
import { wsHub } from '../websocket/server.js';
import { v4 as uuidv4 } from 'uuid';

export class DeviceService {
  public async getAllDevices() {
    return await db.all('SELECT * FROM devices ORDER BY name ASC');
  }

  public async getDeviceById(id: string) {
    return await db.get('SELECT * FROM devices WHERE id = ?', [id]);
  }

  public async getDevicesByRoom(roomId: string) {
    return await db.all('SELECT * FROM devices WHERE room_id = ? ORDER BY name ASC', [roomId]);
  }

  public async getAllRooms() {
    const rooms = await db.all('SELECT * FROM rooms ORDER BY display_order ASC');
    const devices = await db.all('SELECT id, room_id FROM devices');

    return rooms.map((room) => ({
      ...room,
      deviceIds: devices.filter((d) => d.room_id === room.id).map((d) => d.id),
    }));
  }

  public async controlDevice(id: string, action: 'on' | 'off', demoMode: boolean = false) {
    const device = await this.getDeviceById(id);
    if (!device) {
      throw new Error(`Device not found: ${id}`);
    }

    const commandId = uuidv4();
    const actionUpper = action.toUpperCase();

    // 1. If DEMO MODE is active, simulate execution cleanly and return immediately
    if (demoMode || device.support_type === 'demo') {
      await db.run(
        'UPDATE devices SET confirmed_state = ?, pending_state = NULL, error_message = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [action, id]
      );

      await db.run(
        'INSERT INTO activity_logs (id, category, level, title, detail, is_hardware_confirmed) VALUES (?, ?, ?, ?, ?, ?)',
        [`act-${Date.now()}`, 'device', 'info', `[DEMO] ${device.name} -> ${actionUpper}`, 'Simulated execution (Demo Mode)', 0]
      );

      wsHub.broadcast({
        type: 'DEVICE_STATE_CHANGE',
        deviceId: id,
        state: action,
        isHardwareConfirmed: false,
        demoMode: true,
      });

      return {
        success: true,
        deviceId: id,
        confirmedState: action,
        hardwareConfirmed: false,
        executionTimeMs: 15,
        message: `Device ${device.name} set to ${actionUpper} in Demo Mode`,
      };
    }

    // 2. REAL HARDWARE MODE: Execute via single centralized ESP32-WROOM-32
    // Set device to pending state
    await db.run('UPDATE devices SET pending_state = ? WHERE id = ?', [action, id]);

    // Record command in database
    await db.run(
      'INSERT INTO device_commands (id, command_id, device_id, room_id, controller_id, action, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [`cmd-${Date.now()}`, commandId, id, device.room_id, device.controller_id || 'esp32-main-01', actionUpper, 'SENT']
    );

    // Notify frontend of pending state
    wsHub.broadcast({
      type: 'DEVICE_STATE_CHANGE',
      deviceId: id,
      state: 'pending',
      pendingState: action,
    });

    try {
      // Send MQTT command to physical ESP32 and wait for ACK
      const ack = await mqttManager.publishCommand(commandId, id, action, device.gpio_pin);

      return {
        success: true,
        deviceId: id,
        confirmedState: action,
        hardwareConfirmed: true,
        executionTimeMs: ack.execMs || 5,
        message: `Hardware ACK received: ${device.name} confirmed ${actionUpper} on ESP32 pin ${device.gpio_pin || 'MCP Expander'}`,
      };
    } catch (err: any) {
      // Update error state if ESP32 failed or timed out
      await db.run(
        'UPDATE devices SET pending_state = NULL, error_message = ? WHERE id = ?',
        [err.message, id]
      );

      await db.run(
        'INSERT INTO activity_logs (id, category, level, title, detail, is_hardware_confirmed) VALUES (?, ?, ?, ?, ?, ?)',
        [`act-${Date.now()}`, 'device', 'error', `Hardware Error: ${device.name}`, err.message, 0]
      );

      wsHub.broadcast({
        type: 'DEVICE_STATE_CHANGE',
        deviceId: id,
        state: 'error',
        errorMessage: err.message,
      });

      throw err;
    }
  }
}

export const deviceService = new DeviceService();
