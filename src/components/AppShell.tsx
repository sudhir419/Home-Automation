// ============================================================
// APP SHELL — Sidebar, top bar, mobile nav (Premium Redesign)
// ============================================================
import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, Layers, Zap, Lightbulb, Wind, Thermometer, Tv,
  Calendar, Bluetooth, Activity, Settings, ChevronLeft,
  ChevronRight, Sun, Moon, Gauge, Sparkles, ArrowLeft,
  MoreVertical, Bell, Sliders, Info, X, Download,
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useAppStore } from '../store/appStore';
import BluetoothBadge from './BluetoothBadge';
import UserProfileModal from './UserProfileModal';

const NAV_GROUPS = [
  {
    label: 'Main',
    items: [
      { to: '/', icon: Home, label: 'Overview', exact: true },
      { to: '/rooms', icon: Layers, label: 'Rooms' },
      { to: '/devices', icon: Zap, label: 'All Devices' },
      { to: '/electricity', icon: Gauge, label: 'Electricity' },
    ],
  },
  {
    label: 'Categories',
    items: [
      { to: '/lighting', icon: Lightbulb, label: 'Lighting' },
      { to: '/climate', icon: Thermometer, label: 'Climate' },
      { to: '/entertainment', icon: Tv, label: 'Entertainment' },
    ],
  },
  {
    label: 'Control',
    items: [
      { to: '/schedules', icon: Calendar, label: 'Schedules' },
      { to: '/bluetooth', icon: Bluetooth, label: 'Bluetooth' },
      { to: '/activity', icon: Activity, label: 'Activity' },
      { to: '/smart-modes', icon: Sliders, label: 'Smart Modes' },
      { to: '/notifications', icon: Bell, label: 'Notifications' },
    ],
  },
  {
    label: 'App',
    items: [
      { to: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
];

const BOTTOM_NAV = [
  { to: '/', icon: Home, label: 'Home', exact: true },
  { to: '/rooms', icon: Layers, label: 'Rooms' },
  { to: '/devices', icon: Zap, label: 'Devices' },
  { to: '/bluetooth', icon: Bluetooth, label: 'Bluetooth' },
  { to: '/settings', icon: Settings, label: 'More' },
];

// 3-dot overflow menu items
const OVERFLOW_MENU = [
  { to: '/smart-modes', icon: Sliders, label: 'Smart Modes' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/schedules', icon: Calendar, label: 'Schedules' },
  { to: '/activity', icon: Activity, label: 'Activity Log' },
  { to: '/electricity', icon: Gauge, label: 'Electricity' },
];

interface ShellProps {
  children: React.ReactNode;
  onOpen3D?: () => void;
}

export default function AppShell({ children, onOpen3D }: ShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [overflowOpen, setOverflowOpen] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toggle, isDark } = useTheme();
  const activity = useAppStore((s) => s.activity);

  // Check if beforeinstallprompt is ready
  useEffect(() => {
    if ((window as unknown as { deferredPrompt?: unknown }).deferredPrompt) {
      setCanInstall(true);
    }
    const handleReady = () => setCanInstall(true);
    window.addEventListener('pwa-install-ready', handleReady);
    return () => window.removeEventListener('pwa-install-ready', handleReady);
  }, []);

  const handleInstallClick = async () => {
    const promptEvent = (window as unknown as { deferredPrompt?: { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> } }).deferredPrompt;
    if (promptEvent) {
      promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === 'accepted') {
        setCanInstall(false);
      }
      (window as unknown as { deferredPrompt?: unknown }).deferredPrompt = null;
    } else {
      alert('To install Home Automation, tap your browser menu (⋮) and select "Add to Home screen" or "Install app".');
    }
    setOverflowOpen(false);
  };

  // Page title from path
  const pageTitle = getPageTitle(location.pathname);

  // Unread notifications count
  const unreadCount = activity.filter((e) => e.level === 'warning' || e.level === 'error').length;

  // ── Floating pill sliding-indicator ──────────────────────────
  const activeIndex = BOTTOM_NAV.findIndex((item) =>
    item.exact
      ? location.pathname === item.to
      : location.pathname === item.to || location.pathname.startsWith(item.to + '/')
  );
  const pillRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const pill = pillRef.current;
    const activeEl = itemRefs.current[activeIndex];
    if (!pill || !activeEl) return;
    const parent = activeEl.closest('nav') as HTMLElement | null;
    if (!parent) return;
    const parentRect = parent.getBoundingClientRect();
    const itemRect = activeEl.getBoundingClientRect();
    pill.style.transform = `translateX(${itemRect.left - parentRect.left}px)`;
    pill.style.width = `${itemRect.width}px`;
  }, [activeIndex, location.pathname]);

  // Close overflow menu on route change
  useEffect(() => {
    setOverflowOpen(false);
  }, [location.pathname]);

  // Close overflow on outside click
  const overflowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!overflowOpen) return;
    function handleClick(e: MouseEvent) {
      if (overflowRef.current && !overflowRef.current.contains(e.target as Node)) {
        setOverflowOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [overflowOpen]);

  // ── Theme-aware pill styles ───────────────────────────────────
  const navBg = isDark
    ? 'rgba(10,10,10,0.80)'
    : 'rgba(255,255,255,0.85)';
  const navBorder = isDark
    ? '1px solid rgba(255,255,255,0.08)'
    : '1px solid rgba(255,255,255,0.4)';

  return (
    <div className="app-shell">
      {/* User Residence Profile Modal */}
      <UserProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />

      {/* === Desktop Sidebar === */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`} aria-label="Main navigation">
        <div
          className="sidebar-logo"
          style={{ cursor: 'pointer', userSelect: 'none' }}
          onClick={() => setProfileOpen(true)}
          title="Click to view Resident Profile"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setProfileOpen(true); }}
        >
          <div className="sidebar-logo-icon">
            <HomeIcon />
          </div>
          {!collapsed && (
            <div className="sidebar-logo-text" style={{ flex: 1, minWidth: 0 }}>
              <div className="flex items-center justify-between">
                <h1>Home Auto</h1>
                <span
                  style={{
                    fontSize: '10px',
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(16,185,129,0.15)',
                    color: '#10b981',
                    fontWeight: 600,
                    letterSpacing: '0.03em',
                  }}
                >
                  BETA
                </span>
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginTop: 1 }}>
                ESP32 · Smart Home
              </p>
            </div>
          )}
        </div>

        {/* Nav groups */}
        <nav className="sidebar-nav" aria-label="Sidebar navigation">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="nav-group">
              {!collapsed && <div className="nav-group-label">{group.label}</div>}
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon size={18} aria-hidden="true" />
                  {!collapsed && <span className="nav-label">{item.label}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Collapse toggle */}
        <button
          className="sidebar-collapse-btn"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>

      {/* === Desktop/tablet Top Bar === */}
      <header className="topbar" aria-label="Application header">
        <div className="topbar-left">
          {location.pathname !== '/' && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              style={{ padding: '6px 8px' }}
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <h2 className="topbar-title">{pageTitle}</h2>
        </div>
        <div className="topbar-right">
          {onOpen3D && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={onOpen3D}
              aria-label="Open 3D view"
              title="Open 3D Residency View"
              style={{ gap: 'var(--space-1)' }}
            >
              <Sparkles size={18} />
            </button>
          )}
          <BluetoothBadge compact />
          <button
            className="theme-toggle"
            onClick={toggle}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      {/* === Mobile Top Bar === */}
      <header className="mobile-topbar" aria-label="Mobile application header">
        {/* Left: Back or Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          {location.pathname !== '/' ? (
            <button
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '6px', borderRadius: 10,
                color: 'var(--color-text-primary)',
                display: 'flex', alignItems: 'center',
              }}
              onClick={() => navigate(-1)}
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
            </button>
          ) : (
            <div style={{ width: 8 }} />
          )}
          <span style={{
            fontWeight: 700,
            fontSize: 17,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.01em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {location.pathname === '/' ? 'Home Auto' : pageTitle}
          </span>
        </div>

        {/* Right: BT badge, theme, 3D, 3-dot menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {onOpen3D && (
            <button
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '6px', borderRadius: 10,
                color: 'var(--color-text-secondary)',
                display: 'flex', alignItems: 'center',
              }}
              onClick={onOpen3D}
              aria-label="Open 3D view"
            >
              <Sparkles size={18} />
            </button>
          )}
          <BluetoothBadge compact />
          <button
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '6px', borderRadius: 10,
              color: 'var(--color-text-secondary)',
              display: 'flex', alignItems: 'center',
            }}
            onClick={toggle}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* 3-dot overflow menu trigger */}
          <div ref={overflowRef} style={{ position: 'relative' }}>
            <button
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '6px', borderRadius: 10,
                color: 'var(--color-text-secondary)',
                display: 'flex', alignItems: 'center',
                position: 'relative',
              }}
              onClick={() => setOverflowOpen((o) => !o)}
              aria-label="More options"
              aria-expanded={overflowOpen}
            >
              <MoreVertical size={20} />
              {/* Unread dot */}
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: 4, right: 4,
                  width: 7, height: 7, borderRadius: '50%',
                  background: '#ef4444',
                }} />
              )}
            </button>

            {/* Dropdown */}
            {overflowOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  minWidth: 200,
                  borderRadius: 16,
                  background: isDark
                    ? 'rgba(18,18,18,0.95)'
                    : 'rgba(255,255,255,0.97)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid var(--color-border)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                  zIndex: 500,
                  overflow: 'hidden',
                  animation: 'fadeInDown 150ms ease',
                }}
              >
                {/* Header row */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px 8px',
                  borderBottom: '1px solid var(--color-border)',
                }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)' }}>
                    More
                  </span>
                  <button
                    onClick={() => setOverflowOpen(false)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--color-text-tertiary)' }}
                  >
                    <X size={14} />
                  </button>
                </div>
                {/* Install App Button */}
                <button
                  onClick={handleInstallClick}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(16,185,129,0.12)',
                    border: 'none',
                    borderBottom: '1px solid var(--color-border)',
                    color: '#10b981',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 100ms',
                  }}
                >
                  <Download size={18} style={{ color: '#10b981', flexShrink: 0 }} />
                  <span>Install App</span>
                </button>

                {OVERFLOW_MENU.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setOverflowOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 16px',
                        textDecoration: 'none',
                        color: isActive ? '#10b981' : 'var(--color-text-primary)',
                        background: isActive ? 'rgba(16,185,129,0.08)' : 'transparent',
                        fontSize: 14, fontWeight: isActive ? 600 : 400,
                        transition: 'background 100ms',
                      }}
                    >
                      <Icon size={17} style={{ color: isActive ? '#10b981' : 'var(--color-text-secondary)', flexShrink: 0 }} />
                      {item.label}
                      {item.to === '/notifications' && unreadCount > 0 && (
                        <span style={{
                          marginLeft: 'auto', background: '#ef4444', color: '#fff',
                          borderRadius: 10, fontSize: 10, fontWeight: 700,
                          padding: '1px 6px', minWidth: 18, textAlign: 'center',
                        }}>
                          {unreadCount}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* === Main Content === */}
      <main
        className={`main-content page-enter ${collapsed ? 'sidebar-collapsed' : ''}`}
        id="main-content"
        aria-label="Page content"
      >
        {children}
      </main>

      {/* === Bottom Nav (mobile) — Floating Pill with 9:16 Centering & Safe-Area === */}
      <nav
        className="bottom-nav"
        aria-label="Bottom navigation"
        style={{
          position: 'fixed',
          bottom: 'calc(14px + env(safe-area-inset-bottom, 0px))',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 24px)',
          maxWidth: 420,
          zIndex: 200,
          borderRadius: 28,
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          background: navBg,
          border: navBorder,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        {/* Animated sliding indicator pill */}
        <div
          ref={pillRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 6,
            height: 'calc(100% - 12px)',
            borderRadius: 22,
            background: isDark
              ? 'rgba(16,185,129,0.15)'
              : 'rgba(16,185,129,0.12)',
            pointerEvents: 'none',
            transition: 'transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1), width 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            willChange: 'transform, width',
          }}
        />
        <div
          className="bottom-nav-inner"
          style={{
            display: 'flex',
            justifyContent: 'space-evenly',
            alignItems: 'stretch',
            padding: '8px 4px',
            position: 'relative',
          }}
        >
          {BOTTOM_NAV.map((item, idx) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              ref={(el) => { itemRefs.current[idx] = el; }}
              className="bottom-nav-item"
              aria-label={item.label}
              style={({ isActive }) => ({
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                padding: '4px 12px',
                borderRadius: 20,
                textDecoration: 'none',
                color: isActive ? '#10b981' : 'var(--color-text-secondary)',
                transition: 'color 200ms ease',
                minWidth: 48,
                position: 'relative',
                zIndex: 1,
                flex: 1,
              })}
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={21}
                    aria-hidden="true"
                    style={{
                      color: isActive ? '#10b981' : 'var(--color-text-secondary)',
                      transition: 'color 200ms ease',
                    }}
                  />
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: isActive ? 700 : 500,
                      lineHeight: 1,
                      color: isActive ? '#10b981' : 'var(--color-text-secondary)',
                      transition: 'color 200ms ease, font-weight 200ms ease',
                    }}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function getPageTitle(path: string): string {
  const map: Record<string, string> = {
    '/': 'Overview',
    '/rooms': 'Rooms',
    '/devices': 'All Devices',
    '/electricity': 'Electricity',
    '/lighting': 'Lighting',
    '/climate': 'Climate',
    '/entertainment': 'Entertainment',
    '/schedules': 'Schedules',
    '/bluetooth': 'Bluetooth',
    '/activity': 'Activity',
    '/settings': 'Settings',
    '/smart-modes': 'Smart Modes',
    '/notifications': 'Notifications',
  };
  return map[path] ?? 'Home Auto';
}
