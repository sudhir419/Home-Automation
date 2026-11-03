// ==============================================================================
// BACKEND API CLIENT & WEBSOCKET ENGINE (ESP32-WROOM-32 INTEGRATION)
// ==============================================================================

const API_BASE_URL = ((import.meta as any).env?.VITE_API_URL as string) || 'http://localhost:5001/api';
const WS_URL = ((import.meta as any).env?.VITE_WS_URL as string) || 'ws://localhost:5001/ws';

export interface DeviceControlResponse {
  success: boolean;
  deviceId: string;
  confirmedState: 'on' | 'off';
  hardwareConfirmed: boolean;
  executionTimeMs: number;
  message: string;
}

export interface ControllerInfo {
  id: string;
  name: string;
  mac_address: string;
  ip_address: string;
  firmware_version: string;
  status: 'online' | 'offline' | 'error';
  last_heartbeat: string;
}

export class ApiClient {
  private static instance: ApiClient;
  private ws: WebSocket | null = null;
  private reconnectTimer: any = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  private constructor() {
    this.initWebSocket();
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  // --------------------------------------------------------------------------
  // WebSocket Real-Time Connection
  // --------------------------------------------------------------------------
  private initWebSocket() {
    try {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        console.log('✅ Connected to Home Automation WebSocket Server');
        this.emit('connection', { status: 'connected' });
      };

      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type) {
            this.emit(payload.type, payload);
          }
        } catch {
          // ignore
        }
      };

      this.ws.onclose = () => {
        console.warn('⚠️ WebSocket disconnected. Reconnecting in 3 seconds...');
        this.emit('connection', { status: 'disconnected' });
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        this.ws?.close();
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.initWebSocket();
    }, 3000);
  }

  public on(event: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error(`Error in WS event listener (${event}):`, e);
        }
      });
    }
  }

  // --------------------------------------------------------------------------
  // REST API Methods
  // --------------------------------------------------------------------------
  public async getHealth(): Promise<any> {
    const res = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    return await res.json();
  }

  public async getControllers(): Promise<ControllerInfo[]> {
    const res = await fetch(`${API_BASE_URL}/controllers`);
    return await res.json();
  }

  public async getRooms(): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/rooms`);
    return await res.json();
  }

  public async getDevices(): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/devices`);
    return await res.json();
  }

  public async controlDevice(deviceId: string, action: 'on' | 'off', demoMode: boolean = false): Promise<DeviceControlResponse> {
    const res = await fetch(`${API_BASE_URL}/devices/${deviceId}/control`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, demoMode }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Control request failed' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    return await res.json();
  }

  public async getElectricitySummary(filter: string = 'today'): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/electricity/summary?filter=${filter}`);
    return await res.json();
  }

  public async getSchedules(): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/schedules`);
    return await res.json();
  }

  public async createSchedule(schedule: any): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/schedules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schedule),
    });
    return await res.json();
  }

  public async toggleSchedule(id: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/schedules/${id}/toggle`, {
      method: 'PUT',
    });
    return await res.json();
  }

  public async deleteSchedule(id: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/schedules/${id}`, {
      method: 'DELETE',
    });
    return await res.json();
  }

  public async getActivity(): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/activity`);
    return await res.json();
  }

  public async clearActivity(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/activity`, {
      method: 'DELETE',
    });
    return await res.json();
  }
}

export const apiClient = ApiClient.getInstance();
