// ============================================================
// BLUETOOTH HOOK — React integration
// Connects bluetoothService & backend API → appStore
// ============================================================
import { useCallback, useEffect, useRef } from 'react';
import { bluetoothAdapter, buildCommand } from './bluetoothService';
import { useAppStore } from '../../store/appStore';
import { apiClient } from '../api/apiClient';

export function useBluetooth() {
  const setBluetooth = useAppStore((s) => s.setBluetooth);
  const addActivity = useAppStore((s) => s.addActivity);
  const setDeviceState = useAppStore((s) => s.setDeviceState);
  const setPendingState = useAppStore((s) => s.setPendingState);
  const setDeviceError = useAppStore((s) => s.setDeviceError);
  const btState = useAppStore((s) => s.bluetooth);

  // Register message handler once
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    unsubRef.current = bluetoothAdapter.onMessage((msg) => {
      const raw = msg.raw.trim();
      // Parse ACK messages from mock/firmware
      if (raw.startsWith('ACK:')) {
        const cmd = raw.slice(4);
        addActivity({
          category: 'device',
          level: 'success',
          title: `Command acknowledged: ${cmd}`,
          detail: null,
          isHardwareConfirmed: true,
        });
      } else if (raw === 'CONNECTED' || raw.startsWith('CONNECTED:')) {
        setBluetooth({ status: 'connected', lastConnectedAt: new Date().toISOString() });
      } else if (raw === 'DISCONNECTED') {
        setBluetooth({ status: 'disconnected' });
      }
    });

    // Listen to real-time WebSocket state changes from centralized ESP32 backend
    const unsubWs = apiClient.on('DEVICE_STATE_CHANGE', (payload) => {
      if (payload.deviceId && payload.state) {
        if (payload.state === 'pending') {
          setPendingState(payload.deviceId, payload.pendingState || null);
        } else if (payload.state === 'error') {
          setDeviceError(payload.deviceId, payload.errorMessage || 'Hardware error');
        } else {
          setDeviceState(payload.deviceId, payload.state as 'on' | 'off');
        }
      }
    });

    return () => {
      unsubRef.current?.();
      unsubWs();
    };
  }, []); // eslint-disable-line

  const scan = useCallback(async () => {
    setBluetooth({ status: 'scanning', errorMessage: null });
    addActivity({ category: 'bluetooth', level: 'info', title: 'Scanning for devices…', detail: null, isHardwareConfirmed: false });
    try {
      await bluetoothAdapter.startScan((name, address) => {
        setBluetooth({ status: 'ready', deviceName: name, deviceAddress: address });
        addActivity({ category: 'bluetooth', level: 'success', title: `Found: ${name}`, detail: address, isHardwareConfirmed: false });
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setBluetooth({ status: 'error', errorMessage: msg });
      addActivity({ category: 'bluetooth', level: 'error', title: 'Scan failed', detail: msg, isHardwareConfirmed: false });
    }
  }, []);

  const connect = useCallback(async (address: string, name: string) => {
    setBluetooth({ status: 'connecting', deviceName: name, deviceAddress: address, errorMessage: null });
    addActivity({ category: 'bluetooth', level: 'info', title: `Connecting to ${name}…`, detail: null, isHardwareConfirmed: false });
    try {
      await bluetoothAdapter.connect(address);
      setBluetooth({ status: 'connected', deviceName: name, deviceAddress: address, lastConnectedAt: new Date().toISOString() });
      addActivity({ category: 'bluetooth', level: 'success', title: `Connected to ${name}`, detail: null, isHardwareConfirmed: false });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setBluetooth({ status: 'error', errorMessage: msg });
      addActivity({ category: 'bluetooth', level: 'error', title: 'Connection failed', detail: msg, isHardwareConfirmed: false });
    }
  }, []);

  const disconnect = useCallback(async () => {
    const name = btState.deviceName;
    try {
      await bluetoothAdapter.disconnect();
      setBluetooth({ status: 'disconnected', errorMessage: null });
      addActivity({ category: 'bluetooth', level: 'info', title: `Disconnected${name ? ` from ${name}` : ''}`, detail: null, isHardwareConfirmed: false });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setBluetooth({ status: 'error', errorMessage: msg });
    }
  }, [btState.deviceName]);

  const sendDeviceCommand = useCallback(async (deviceId: string, action: 'on' | 'off', demoMode: boolean) => {
    const cmd = buildCommand(deviceId, action);

    // 1. If in DEMO MODE: Simulate locally and optionally notify backend
    if (demoMode) {
      setPendingState(deviceId, action === 'on' ? 'on' : 'off');
      await new Promise((r) => setTimeout(r, 600));
      setDeviceState(deviceId, action === 'on' ? 'on' : 'off');
      addActivity({
        category: 'device',
        level: 'info',
        title: `[DEMO] ${cmd ? cmd.trim() : deviceId} executed`,
        detail: 'Simulated — no hardware confirmation',
        isHardwareConfirmed: false,
      });

      // Async report to backend in background (demo mode)
      apiClient.controlDevice(deviceId, action, true).catch(() => {});
      return true;
    }

    // 2. REAL HARDWARE MODE: Connect to physical ESP32-WROOM-32 via Backend REST/MQTT
    setPendingState(deviceId, action === 'on' ? 'on' : 'off');
    addActivity({
      category: 'device',
      level: 'info',
      title: `Sending command: ${cmd ? cmd.trim() : `${deviceId} -> ${action}`}`,
      detail: 'Transmitting via MQTT to ESP32-WROOM-32...',
      isHardwareConfirmed: false,
    });

    try {
      // First attempt: Backend REST / MQTT API to centralized ESP32
      const res = await apiClient.controlDevice(deviceId, action, false);
      setDeviceState(deviceId, action === 'on' ? 'on' : 'off');
      addActivity({
        category: 'device',
        level: 'success',
        title: `Hardware ACK: ${deviceId.toUpperCase()}`,
        detail: `${res.message} (${res.executionTimeMs}ms)`,
        isHardwareConfirmed: true,
      });
      return true;
    } catch (apiErr: any) {
      // If direct Bluetooth is connected locally, try bluetoothAdapter fallback
      if (bluetoothAdapter.isConnected() && cmd) {
        try {
          await bluetoothAdapter.sendCommand(cmd);
          setDeviceState(deviceId, action === 'on' ? 'on' : 'off');
          return true;
        } catch (btErr: any) {
          const msg = btErr instanceof Error ? btErr.message : String(btErr);
          setDeviceError(deviceId, msg);
          addActivity({ category: 'device', level: 'error', title: `Command failed: ${cmd.trim()}`, detail: msg, isHardwareConfirmed: false });
          return false;
        }
      }

      // Hardware failed or timed out
      const msg = apiErr instanceof Error ? apiErr.message : String(apiErr);
      setDeviceError(deviceId, msg);
      addActivity({ category: 'device', level: 'error', title: `Hardware Error: ${deviceId}`, detail: msg, isHardwareConfirmed: false });
      return false;
    }
  }, []);

  return {
    status: btState.status,
    deviceName: btState.deviceName,
    deviceAddress: btState.deviceAddress,
    errorMessage: btState.errorMessage,
    lastConnectedAt: btState.lastConnectedAt,
    isDemo: btState.isDemo,
    scan,
    connect,
    disconnect,
    sendDeviceCommand,
  };
}
