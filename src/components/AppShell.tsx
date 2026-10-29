// ============================================================
// APP SHELL — Sidebar, top bar, mobile nav
// ============================================================
import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home, Layers, Zap, Lightbulb, Wind, Thermometer, Tv,
  Calendar, Bluetooth, Activity, Settings, ChevronLeft,
  ChevronRight, Menu, X, Sun, Moon, Bell, User,
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
  { to: '/devices', icon: Zap, label: 'Devices' },
  { to: '/schedules', icon: Calendar, label: 'Schedules' },
  { to: '/bluetooth', icon: Bluetooth, label: 'Bluetooth' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

interface ShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: ShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const { toggle, isDark } = useTheme();

  // Close drawer on navigation
  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);

  // Page title from path
  const pageTitle = getPageTitle(location.pathname);

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
                    padding: '2px 7px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--color-highlight-light)',
                    color: 'var(--color-highlight)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  Profile
                </span>
              </div>
              <span>Smart Living &middot; Resident MR</span>
            </div>
          )}
        </div>

        <nav className="sidebar-nav" aria-label="Navigation">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <div className="sidebar-section-label">{group.label}</div>
              )}
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) =>
                    `nav-item ${isActive ? 'active' : ''}`
                  }
                  aria-label={item.label}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon size={18} aria-hidden="true" />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </aside>

      {/* === Desktop Top Bar === */}
      <header className={`topbar ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="topbar-left">
          <span className="topbar-breadcrumb">{pageTitle}</span>
        </div>
        <div className="topbar-right">
          <button
            className="user-profile-btn"
            onClick={() => setProfileOpen(true)}
            aria-label="View resident profile"
            title="Resident Profile"
          >
            <div className="user-avatar-badge">MR</div>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>Resident</span>
          </button>
          <BluetoothBadge />
          <button className="theme-toggle" onClick={toggle} aria-label="Toggle theme">
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      {/* === Mobile Top Bar === */}
      <header className="mobile-topbar" aria-label="Mobile navigation">
        <button
          className="btn btn-ghost btn-icon"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={drawerOpen}
        >
          <Menu size={20} />
        </button>
        <button
          onClick={() => setProfileOpen(true)}
          style={{
            background: 'none',
            border: 'none',
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
          title="Click to view Resident Profile"
        >
          <span>{pageTitle}</span>
          <span
            style={{
              fontSize: '10px',
              padding: '1px 6px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-highlight-light)',
              color: 'var(--color-highlight)'
            }}
          >
            MR
          </span>
        </button>
        <div className="flex items-center gap-2">
          <BluetoothBadge compact />
          <button className="theme-toggle" onClick={toggle} aria-label="Toggle theme">
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      {/* === Mobile Drawer overlay === */}
      <div
        className={`mobile-nav-overlay ${drawerOpen ? 'visible' : ''}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* === Mobile Drawer === */}
      <nav className={`mobile-drawer ${drawerOpen ? 'open' : ''}`} aria-label="Mobile menu" aria-hidden={!drawerOpen}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon"><HomeIcon /></div>
          <div className="sidebar-logo-text">
            <h1>Home Auto</h1>
            <span>Smart Living</span>
          </div>
          <button
            className="btn btn-ghost btn-icon"
            style={{ marginLeft: 'auto' }}
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>
        <div className="sidebar-nav">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <div className="sidebar-section-label">{group.label}</div>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  <item.icon size={18} aria-hidden="true" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </div>
      </nav>

      {/* === Bottom Nav (mobile) === */}
      <nav className="bottom-nav" aria-label="Bottom navigation">
        <div className="bottom-nav-inner">
          {BOTTOM_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
              aria-label={item.label}
            >
              <item.icon aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* === Main Content === */}
      <main
        className={`main-content ${collapsed ? 'sidebar-collapsed' : ''}`}
        id="main-content"
        aria-label="Page content"
      >
        {children}
      </main>
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
    '/lighting': 'Lighting',
    '/climate': 'Climate',
    '/entertainment': 'Entertainment',
    '/schedules': 'Schedules',
    '/bluetooth': 'Bluetooth',
    '/activity': 'Activity',
    '/settings': 'Settings',
  };
  return map[path] ?? 'Home Automation';
}
