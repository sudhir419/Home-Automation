// ============================================================
// APP ROOT
// ============================================================
import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AppShell from './components/AppShell';
import IntroScreen from './components/IntroScreen';
import Residency3DView from './components/Residency3DView';
import ToastContainer from './components/ToastContainer';
import CustomCursor from './components/CustomCursor';
import { useTheme } from './hooks/useTheme';
import { useAppStore } from './store/appStore';
import { apiClient } from './services/api/apiClient';
import { showToast } from './components/ToastContainer';

// Pages
import DashboardPage from './pages/DashboardPage';
import DevicesPage from './pages/DevicesPage';
import RoomsPage from './pages/RoomsPage';
import ElectricityPage from './pages/ElectricityPage';
import LightingPage from './pages/LightingPage';
import ClimatePage from './pages/ClimatePage';
import EntertainmentPage from './pages/EntertainmentPage';
import SchedulesPage from './pages/SchedulesPage';
import BluetoothPage from './pages/BluetoothPage';
import ActivityPage from './pages/ActivityPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  // Apply theme on mount
  useTheme();

  const preferences = useAppStore((s) => s.preferences);
  // Stages: 'intro' (Splash) -> 'residency3d' (Green 3D Home & Appliances) -> 'dashboard' (Main App)
  const [appStage, setAppStage] = useState<'intro' | 'residency3d' | 'dashboard'>('intro');

  // Handle reduced-motion preference
  useEffect(() => {
    if (preferences.reducedMotion ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.style.setProperty('--transition-fast', '0ms');
      document.documentElement.style.setProperty('--transition-base', '0ms');
      document.documentElement.style.setProperty('--transition-slow', '0ms');
      document.documentElement.style.setProperty('--transition-panel', '0ms');
    }
  }, [preferences.reducedMotion]);

  // Real-time backend & hardware event notifications
  useEffect(() => {
    const unsubSchedule = apiClient.on('SCHEDULE_TRIGGERED', (payload) => {
      showToast(`Schedule "${payload.name}" triggered (${payload.devicesTriggered} devices)`, 'info');
    });

    const unsubController = apiClient.on('CONTROLLER_STATUS', (payload) => {
      if (payload.status === 'online') {
        showToast('ESP32-WROOM-32 Controller Connected (Online)', 'success');
      } else {
        showToast('ESP32 Controller Disconnected (Offline)', 'warning');
      }
    });

    return () => {
      unsubSchedule();
      unsubController();
    };
  }, []);

  return (
    <>
      {appStage === 'intro' && (
        <IntroScreen onDone={() => setAppStage('residency3d')} />
      )}

      {appStage === 'residency3d' && (
        <Residency3DView
          onBackToHome={() => setAppStage('dashboard')}
          onBackToIntro={() => setAppStage('intro')}
        />
      )}

      {appStage === 'dashboard' && (
        <AppShell onOpen3D={() => setAppStage('residency3d')}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/rooms" element={<RoomsPage />} />
            <Route path="/devices" element={<DevicesPage />} />
            <Route path="/electricity" element={<ElectricityPage />} />
            <Route path="/lighting" element={<LightingPage />} />
            <Route path="/climate" element={<ClimatePage />} />
            <Route path="/entertainment" element={<EntertainmentPage />} />
            <Route path="/schedules" element={<SchedulesPage />} />
            <Route path="/bluetooth" element={<BluetoothPage />} />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </AppShell>
      )}

      <ToastContainer />
      <CustomCursor />
    </>
  );
}
