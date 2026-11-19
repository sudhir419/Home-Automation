// ============================================================
// LIVE HARDWARE SIMULATOR — Demo-ready realistic telemetry
// Generates wattage fluctuations, voltage, motion events,
// and simulated latency so the app works with no physical relays.
// ============================================================

export interface SimulatorTelemetry {
  totalWatts: number;
  voltage: number;
  frequency: number;
  motionDetected: boolean;
  doorOpen: boolean;
  temperature: number;
  humidity: number;
  latencyMs: number;
  rssi: number;
  timestamp: Date;
}

class HardwareSimulator {
  private _enabled = false;
  private _interval: ReturnType<typeof setInterval> | null = null;
  private _listeners: Array<(data: SimulatorTelemetry) => void> = [];
  private _baseWatts = 175;
  private _tick = 0;

  get isEnabled(): boolean { return this._enabled; }

  enable(): void {
    if (this._enabled) return;
    this._enabled = true;
    this._tick = 0;
    this._interval = setInterval(() => {
      this._tick++;
      const data = this._generateTelemetry();
      this._listeners.forEach((l) => l(data));
    }, 1000);
  }

  disable(): void {
    this._enabled = false;
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
  }

  onTelemetry(listener: (data: SimulatorTelemetry) => void): () => void {
    this._listeners.push(listener);
    return () => { this._listeners = this._listeners.filter((l) => l !== listener); };
  }

  getSnapshot(): SimulatorTelemetry {
    return this._generateTelemetry();
  }

  private _generateTelemetry(): SimulatorTelemetry {
    const t = this._tick;
    // Realistic wattage fluctuation (sine wave + noise)
    const wattNoise = Math.sin(t * 0.15) * 25 + Math.sin(t * 0.4) * 12 + (Math.random() - 0.5) * 18;
    const totalWatts = Math.max(0, Math.round(this._baseWatts + wattNoise));

    // Indian grid voltage (220V ± 5%)
    const voltage = 220 + Math.sin(t * 0.3) * 8 + (Math.random() - 0.5) * 4;

    // Grid frequency (50Hz ± 0.2Hz)
    const frequency = 50 + Math.sin(t * 0.1) * 0.15 + (Math.random() - 0.5) * 0.1;

    // Sporadic motion detection
    const motionDetected = Math.random() > 0.92;

    // Door occasionally opens
    const doorOpen = Math.sin(t * 0.02) > 0.85;

    // Ambient temperature drift
    const temperature = 25.5 + Math.sin(t * 0.05) * 2.5 + (Math.random() - 0.5) * 0.5;

    // Humidity
    const humidity = 55 + Math.sin(t * 0.03) * 8 + (Math.random() - 0.5) * 3;

    // Simulated latency
    const latencyMs = 8 + Math.floor(Math.random() * 15);

    // RSSI signal strength
    const rssi = -45 + Math.floor(Math.sin(t * 0.08) * 10) + Math.floor((Math.random() - 0.5) * 6);

    return {
      totalWatts,
      voltage: Number(voltage.toFixed(1)),
      frequency: Number(frequency.toFixed(2)),
      motionDetected,
      doorOpen,
      temperature: Number(temperature.toFixed(1)),
      humidity: Number(humidity.toFixed(0)),
      latencyMs,
      rssi,
      timestamp: new Date(),
    };
  }

  setBaseWatts(watts: number): void {
    this._baseWatts = watts;
  }
}

export const simulator = new HardwareSimulator();
