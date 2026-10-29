// ============================================================
// THEME HOOK
// ============================================================
import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';

export function useTheme() {
  const theme = useAppStore((s) => s.preferences.theme);
  const setPreference = useAppStore((s) => s.setPreference);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const apply = () => root.setAttribute('data-theme', mq.matches ? 'dark' : 'light');
      apply();
      mq.addEventListener('change', apply);
      return () => mq.removeEventListener('change', apply);
    } else {
      root.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const toggle = () => {
    const current = document.documentElement.getAttribute('data-theme');
    setPreference('theme', current === 'dark' ? 'light' : 'dark');
  };

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  return { theme, setTheme: (t: 'light' | 'dark' | 'system') => setPreference('theme', t), toggle, isDark };
}
