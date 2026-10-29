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
// To swap to a real plugin:
//   1. Install the plugin (e.g. @capacitor-community/bluetooth-le or a native module)
//   2. Implement BluetoothAdapter against the plugin's API
//   3. Export it here instead of MockBluetoothAdapter
export const bluetoothAdapter: BluetoothAdapter = new MockBluetoothAdapter();

// ---- Command helpers ------------------------------------------------------------
export function buildCommand(deviceId: string, action: 'on' | 'off'): string | null {
  const map = COMMANDS[deviceId];
  if (!map) return null;
  return (action === 'on' ? map.on : map.off) + COMMAND_TERMINATOR;
}
