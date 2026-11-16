// ============================================================
// BLUETOOTH SERVICE — Abstraction layer
//
// This module separates Bluetooth protocol from UI components.
// In demo / browser mode, a MockAdapter is used.
// When running in the Android APK with a Bluetooth plugin,
// replace MockAdapter with the plugin-specific implementation.
//
// Protocol notes:
//   • The ESP32 firmware is NOT yet finalized.
//   • Confirmed to use two LED outputs (Light 1, Light 2).
//   • Wire format: newline-terminated ASCII commands, e.g. "L1_ON\n"
//   • If BLE is used: service/characteristic UUIDs must match firmware.
//   • If BT Classic SPP: use a compatible native Android plugin.
//   • Do NOT use Web Bluetooth for BT Classic Serial.
// ============================================================

export interface BluetoothMessage {
  raw: string;
  timestamp: Date;
}

export interface BluetoothAdapter {
  /** Returns true if Bluetooth is available on this platform */
  checkSupport(): Promise<boolean>;

  /** Request necessary Android permissions */
  requestPermissions(): Promise<boolean>;

  /** Start scanning for devices */
  startScan(onFound: (name: string, address: string) => void): Promise<void>;

  /** Stop scanning */
  stopScan(): Promise<void>;

  /** Connect to a device by address */
  connect(address: string): Promise<void>;

  /** Disconnect */
  disconnect(): Promise<void>;

  /** Send a command string. Add line terminator as needed. */
  sendCommand(command: string): Promise<void>;

  /** Register a handler for incoming messages */
  onMessage(handler: (msg: BluetoothMessage) => void): () => void;

  /** True while connected */
  isConnected(): boolean;
}

// ---- Command definitions --------------------------------------------------------
// These must exactly match the ESP32 firmware.
// Changing the protocol only requires updating this mapping.
export const COMMANDS: Record<string, { on: string; off: string }> = {
  'light-1': { on: 'L1_ON', off: 'L1_OFF' },
  'light-2': { on: 'L2_ON', off: 'L2_OFF' },
  // Add more as firmware grows:
  // 'light-3': { on: 'L3_ON', off: 'L3_OFF' },
};

export const COMMAND_TERMINATOR = '\n'; // adjust if firmware uses '\r\n'

// ---- BLE Config helper ----------------------------------------------------------
export interface BLEConfig {
  serviceUUID: string;
  txCharUUID: string;
}

export function getBLEConfig(): BLEConfig {
  try {
    const stored = JSON.parse(localStorage.getItem('ble-config') || '{}');
    return {
      serviceUUID: stored.serviceUUID || '4fafc201-1fb5-459e-8fcc-c5c9c331914b',
      txCharUUID: stored.txCharUUID || 'beb5483e-36e1-4688-b7f5-ea07361b26a8',
    };
  } catch {
    return {
      serviceUUID: '4fafc201-1fb5-459e-8fcc-c5c9c331914b',
      txCharUUID: 'beb5483e-36e1-4688-b7f5-ea07361b26a8',
    };
  }
}

// ---- Web Bluetooth Declarations ------------------------------------------------
// Web Bluetooth is a draft web standard available in Chromium/Android Chrome.
type BluetoothDevice = any;
type BluetoothRemoteGATTServer = any;
type BluetoothRemoteGATTCharacteristic = any;

declare global {
  interface Navigator {
    bluetooth?: {
      requestDevice(options: any): Promise<BluetoothDevice>;
    };
  }
}

// ---- Web Bluetooth Adapter (Chrome / HTTPS) -------------------------------------
// Uses the Web Bluetooth API (navigator.bluetooth) for real BLE connections.
// Requires HTTPS or localhost. Only available in Chrome/Chromium-based browsers.
class WebBluetoothAdapter implements BluetoothAdapter {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private txCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private _handlers: Array<(msg: BluetoothMessage) => void> = [];

  async checkSupport(): Promise<boolean> {
    return 'bluetooth' in navigator;
  }

  async requestPermissions(): Promise<boolean> {
    // Web Bluetooth handles permissions via the device picker dialog
    return true;
  }

  async startScan(onFound: (name: string, address: string) => void): Promise<void> {
    if (!navigator.bluetooth) {
      throw new Error('Web Bluetooth not supported in this browser');
    }

    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      throw new Error(
        'Web Bluetooth requires HTTPS. Please use the Vercel URL or localhost.'
      );
    }

    const config = getBLEConfig();

    this.device = await navigator.bluetooth.requestDevice({
      filters: [{ services: [config.serviceUUID] }],
      optionalServices: [config.serviceUUID],
    });

    if (this.device?.name && this.device?.id) {
      onFound(this.device.name || 'ESP32 Device', this.device.id);
    }
  }

  async stopScan(): Promise<void> {
    // Web Bluetooth scan ends automatically after requestDevice resolves
  }

  async connect(address: string): Promise<void> {
    if (!this.device) {
      throw new Error('No device selected. Run scan first.');
    }

    const config = getBLEConfig();
    this.server = await this.device.gatt!.connect();
    const service = await this.server.getPrimaryService(config.serviceUUID);
    this.txCharacteristic = await service.getCharacteristic(config.txCharUUID);

    this._emit(`CONNECTED:${address}`);
  }

  async disconnect(): Promise<void> {
    if (this.server?.connected) {
      this.server.disconnect();
    }
    this.device = null;
    this.server = null;
    this.txCharacteristic = null;
    this._emit('DISCONNECTED');
  }

  async sendCommand(command: string): Promise<void> {
    if (!this.txCharacteristic) {
      throw new Error('Not connected to BLE device');
    }
    const encoder = new TextEncoder();
    await this.txCharacteristic.writeValue(encoder.encode(command + '\n'));
    this._emit(`ACK:${command.trim()}`);
  }

  onMessage(handler: (msg: BluetoothMessage) => void): () => void {
    this._handlers.push(handler);
    return () => {
      this._handlers = this._handlers.filter((h) => h !== handler);
    };
  }

  isConnected(): boolean {
    return this.server?.connected ?? false;
  }

  private _emit(raw: string): void {
    const msg: BluetoothMessage = { raw, timestamp: new Date() };
    this._handlers.forEach((h) => h(msg));
  }
}

// ---- Mock Adapter (Demo / browser mode) -----------------------------------------
// Simulates connection and command ACK with delays.
// Clearly NOT real hardware. Always labeled in the UI.
class MockBluetoothAdapter implements BluetoothAdapter {
  private _connected = false;
  private _handlers: Array<(msg: BluetoothMessage) => void> = [];

  async checkSupport() { return true; }
  async requestPermissions() { return true; }

  async startScan(onFound: (name: string, address: string) => void) {
    await new Promise((r) => setTimeout(r, 800));
    onFound('ESP32-HomeAuto [DEMO]', '00:11:22:33:44:55');
  }

  async stopScan() { /* no-op */ }

  async connect(address: string) {
    await new Promise((r) => setTimeout(r, 1200));
    if (address === '') throw new Error('No device selected');
    this._connected = true;
    this._emit(`CONNECTED:${address}`);
  }

  async disconnect() {
    await new Promise((r) => setTimeout(r, 400));
    this._connected = false;
    this._emit('DISCONNECTED');
  }

  async sendCommand(command: string) {
    if (!this._connected) throw new Error('Not connected');
    await new Promise((r) => setTimeout(r, 300));
    // Echo back an ACK so the UI can confirm
    this._emit(`ACK:${command.trim()}`);
  }

  onMessage(handler: (msg: BluetoothMessage) => void) {
    this._handlers.push(handler);
    return () => {
      this._handlers = this._handlers.filter((h) => h !== handler);
    };
  }

  isConnected() { return this._connected; }

  private _emit(raw: string) {
    const msg: BluetoothMessage = { raw, timestamp: new Date() };
    this._handlers.forEach((h) => h(msg));
  }
}

// ---- Public singleton -----------------------------------------------------------
// Automatically picks WebBluetoothAdapter when navigator.bluetooth is present
// (Chrome on HTTPS/localhost), otherwise falls back to MockBluetoothAdapter.
//
// To swap to a Capacitor BLE plugin for the Android APK:
//   1. Install the plugin (e.g. @capacitor-community/bluetooth-le)
//   2. Implement BluetoothAdapter against the plugin's API
//   3. Export it here instead
export const bluetoothAdapter: BluetoothAdapter =
  'bluetooth' in navigator
    ? new WebBluetoothAdapter()
    : new MockBluetoothAdapter();

// ---- Command helpers ------------------------------------------------------------
export function buildCommand(deviceId: string, action: 'on' | 'off'): string | null {
  const map = COMMANDS[deviceId];
  if (!map) return null;
  return (action === 'on' ? map.on : map.off) + COMMAND_TERMINATOR;
}
