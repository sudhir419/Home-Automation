// ============================================================
// BLUETOOTH HOOK — React integration
// Connects bluetoothService → appStore
// ============================================================
import { useCallback, useEffect, useRef } from 'react';
import { bluetoothAdapter, buildCommand } from './bluetoothService';
import { useAppStore } from '../../store/appStore';

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

    return () => { unsubRef.current?.(); };
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
    if (!cmd) {
      addActivity({ category: 'device', level: 'warning', title: `No command mapped for device: ${deviceId}`, detail: null, isHardwareConfirmed: false });
      return false;
    }

    if (demoMode || !bluetoothAdapter.isConnected()) {
      // Demo: simulate success after delay
      setPendingState(deviceId, action === 'on' ? 'on' : 'off');
      await new Promise((r) => setTimeout(r, 600));
      setDeviceState(deviceId, action === 'on' ? 'on' : 'off');
      addActivity({
        category: 'device',
        level: 'info',
        title: `[DEMO] ${cmd.trim()} executed`,
        detail: 'Simulated — no hardware confirmation',
        isHardwareConfirmed: false,
      });
      return true;
    }

    setPendingState(deviceId, action === 'on' ? 'on' : 'off');
    addActivity({ category: 'device', level: 'info', title: `Sending: ${cmd.trim()}`, detail: null, isHardwareConfirmed: false });

    try {
      await bluetoothAdapter.sendCommand(cmd);
      setDeviceState(deviceId, action === 'on' ? 'on' : 'off');
      return true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setDeviceError(deviceId, msg);
      addActivity({ category: 'device', level: 'error', title: `Command failed: ${cmd.trim()}`, detail: msg, isHardwareConfirmed: false });
      return false;
    }
  }, []);

  return { scan, connect, disconnect, sendDeviceCommand, btState };
}
