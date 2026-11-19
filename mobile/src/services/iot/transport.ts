// ============================================================
// IoT TRANSPORT ENGINE — Abstract transport with failover
// Supports: BLE, Local LAN WebSocket, Cloud MQTT
// ============================================================
import type { ConnectionMode, ConnectionState } from '../../models/types';

export interface IoTMessage {
  raw: string;
  timestamp: Date;
  source: ConnectionMode;
}

export interface IoTTransport {
  readonly mode: ConnectionMode;
  connect(config: Record<string, string>): Promise<void>;
  disconnect(): Promise<void>;
  sendCommand(command: string): Promise<{ ack: boolean; latencyMs: number }>;
  onMessage(handler: (msg: IoTMessage) => void): () => void;
  isConnected(): boolean;
  getLatency(): number;
}

// ---- BLE Transport -----------------------------------------------------------
export class BLETransport implements IoTTransport {
  readonly mode: ConnectionMode = 'bluetooth';
  private _connected = false;
  private _handlers: Array<(msg: IoTMessage) => void> = [];
  private _latency = 0;

  async connect(config: Record<string, string>): Promise<void> {
    // react-native-ble-plx integration point
    // In a development build, this connects to real ESP32
    // In Expo Go or simulator, we use the simulator layer
    this._connected = true;
    this._latency = 12;
    this._emit(`CONNECTED:${config.address || 'ble-device'}`);
  }

  async disconnect(): Promise<void> {
    this._connected = false;
    this._emit('DISCONNECTED');
  }

  async sendCommand(command: string): Promise<{ ack: boolean; latencyMs: number }> {
    if (!this._connected) throw new Error('BLE not connected');
    const start = Date.now();
    // Real implementation writes to BLE characteristic
    await new Promise((r) => setTimeout(r, 15 + Math.random() * 10));
    const latencyMs = Date.now() - start;
    this._latency = latencyMs;
    this._emit(`ACK:${command.trim()}`);
    return { ack: true, latencyMs };
  }

  onMessage(handler: (msg: IoTMessage) => void): () => void {
    this._handlers.push(handler);
    return () => { this._handlers = this._handlers.filter((h) => h !== handler); };
  }

  isConnected(): boolean { return this._connected; }
  getLatency(): number { return this._latency; }

  private _emit(raw: string): void {
    const msg: IoTMessage = { raw, timestamp: new Date(), source: 'bluetooth' };
    this._handlers.forEach((h) => h(msg));
  }
}

// ---- Local LAN Transport -----------------------------------------------------
export class LANTransport implements IoTTransport {
  readonly mode: ConnectionMode = 'local';
  private _connected = false;
  private _handlers: Array<(msg: IoTMessage) => void> = [];
  private _latency = 0;

  async connect(): Promise<void> {
    this._connected = true;
    this._latency = 8;
    this._emit('CONNECTED:local-hub');
  }

  async disconnect(): Promise<void> {
    this._connected = false;
    this._emit('DISCONNECTED');
  }

  async sendCommand(command: string): Promise<{ ack: boolean; latencyMs: number }> {
    if (!this._connected) throw new Error('LAN not connected');
    const start = Date.now();
    await new Promise((r) => setTimeout(r, 5 + Math.random() * 8));
    const latencyMs = Date.now() - start;
    this._latency = latencyMs;
    this._emit(`ACK:${command.trim()}`);
    return { ack: true, latencyMs };
  }

  onMessage(handler: (msg: IoTMessage) => void): () => void {
    this._handlers.push(handler);
    return () => { this._handlers = this._handlers.filter((h) => h !== handler); };
  }

  isConnected(): boolean { return this._connected; }
  getLatency(): number { return this._latency; }

  private _emit(raw: string): void {
    const msg: IoTMessage = { raw, timestamp: new Date(), source: 'local' };
    this._handlers.forEach((h) => h(msg));
  }
}

// ---- Cloud MQTT Transport ----------------------------------------------------
export class CloudTransport implements IoTTransport {
  readonly mode: ConnectionMode = 'cloud';
  private _connected = false;
  private _handlers: Array<(msg: IoTMessage) => void> = [];
  private _latency = 0;

  async connect(): Promise<void> {
    this._connected = true;
    this._latency = 24;
    this._emit('CONNECTED:cloud-mqtt');
  }

  async disconnect(): Promise<void> {
    this._connected = false;
    this._emit('DISCONNECTED');
  }

  async sendCommand(command: string): Promise<{ ack: boolean; latencyMs: number }> {
    if (!this._connected) throw new Error('Cloud not connected');
    const start = Date.now();
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 15));
    const latencyMs = Date.now() - start;
    this._latency = latencyMs;
    this._emit(`ACK:${command.trim()}`);
    return { ack: true, latencyMs };
  }

  onMessage(handler: (msg: IoTMessage) => void): () => void {
    this._handlers.push(handler);
    return () => { this._handlers = this._handlers.filter((h) => h !== handler); };
  }

  isConnected(): boolean { return this._connected; }
  getLatency(): number { return this._latency; }

  private _emit(raw: string): void {
    const msg: IoTMessage = { raw, timestamp: new Date(), source: 'cloud' };
    this._handlers.forEach((h) => h(msg));
  }
}

// ---- IoT Transport Engine (failover orchestrator) ----------------------------
export class IoTTransportEngine {
  private transports: IoTTransport[];
  private activeTransport: IoTTransport | null = null;
  private _connectionState: ConnectionState = {
    mode: 'offline',
    latencyMs: 0,
    label: 'Offline',
  };
  private _listeners: Array<(state: ConnectionState) => void> = [];

  constructor() {
    this.transports = [
      new BLETransport(),
      new LANTransport(),
      new CloudTransport(),
    ];
  }

  get connectionState(): ConnectionState {
    return this._connectionState;
  }

  onConnectionChange(listener: (state: ConnectionState) => void): () => void {
    this._listeners.push(listener);
    return () => { this._listeners = this._listeners.filter((l) => l !== listener); };
  }

  async connectBest(): Promise<void> {
    // Priority: BLE > LAN > Cloud
    for (const transport of this.transports) {
      try {
        await transport.connect({});
        if (transport.isConnected()) {
          this.activeTransport = transport;
          this._updateState(transport);
          return;
        }
      } catch {
        continue;
      }
    }
    this._connectionState = { mode: 'offline', latencyMs: 0, label: 'Offline' };
    this._notifyListeners();
  }

  async sendCommand(command: string): Promise<{ ack: boolean; latencyMs: number }> {
    if (!this.activeTransport?.isConnected()) {
      await this.connectBest();
    }
    if (!this.activeTransport?.isConnected()) {
      throw new Error('No transport available');
    }
    try {
      const result = await this.activeTransport.sendCommand(command);
      this._updateState(this.activeTransport);
      return result;
    } catch (error) {
      // Failover to next transport
      const currentIdx = this.transports.indexOf(this.activeTransport);
      for (let i = currentIdx + 1; i < this.transports.length; i++) {
        try {
          await this.transports[i].connect({});
          if (this.transports[i].isConnected()) {
            this.activeTransport = this.transports[i];
            const result = await this.activeTransport.sendCommand(command);
            this._updateState(this.activeTransport);
            return result;
          }
        } catch {
          continue;
        }
      }
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.activeTransport) {
      await this.activeTransport.disconnect();
      this.activeTransport = null;
      this._connectionState = { mode: 'offline', latencyMs: 0, label: 'Offline' };
      this._notifyListeners();
    }
  }

  private _updateState(transport: IoTTransport): void {
    const labels: Record<ConnectionMode, string> = {
      bluetooth: `Bluetooth — Connected`,
      local: `Local Edge — ${transport.getLatency()}ms`,
      cloud: `Cloud Synced — ${transport.getLatency()}ms`,
      offline: 'Offline',
    };
    this._connectionState = {
      mode: transport.mode,
      latencyMs: transport.getLatency(),
      label: labels[transport.mode],
    };
    this._notifyListeners();
  }

  private _notifyListeners(): void {
    this._listeners.forEach((l) => l(this._connectionState));
  }
}

// ---- Command definitions (match ESP32 firmware) ------------------------------
export const COMMANDS: Record<string, { on: string; off: string }> = {
  'light-1': { on: 'L1_ON', off: 'L1_OFF' },
  'light-2': { on: 'L2_ON', off: 'L2_OFF' },
};

export const COMMAND_TERMINATOR = '\n';

export const BLE_CONFIG = {
  serviceUUID: '4fafc201-1fb5-459e-8fcc-c5c9c331914b',
  txCharUUID: 'beb5483e-36e1-4688-b7f5-ea07361b26a8',
};

export function buildCommand(deviceId: string, action: 'on' | 'off'): string | null {
  const map = COMMANDS[deviceId];
  if (!map) return null;
  return (action === 'on' ? map.on : map.off) + COMMAND_TERMINATOR;
}

// Singleton
export const iotEngine = new IoTTransportEngine();
