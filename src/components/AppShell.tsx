// ============================================================
// APP SHELL — Sidebar, top bar, mobile nav (Premium Redesign)
// ============================================================
import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Home, Layers, Zap, Lightbulb, Wind, Thermometer, Tv,
  Calendar, Bluetooth, Activity, Settings, ChevronLeft,
  ChevronRight, Sun, Moon, Gauge, Sparkles, ArrowLeft,
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
      { to: '/electricity', icon: Gauge, label: 'Electricity Consumption' },
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
  { to: '/schedules', icon: Calendar, label: 'Automations' },
  { to: '/bluetooth', icon: Bluetooth, label: 'Bluetooth' },
  { to: '/settings', icon: Settings, label: 'More' },
];

interface ShellProps {
  children: React.ReactNode;
  onOpen3D?: () => void;
}

export default function AppShell({ children, onOpen3D }: ShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const { toggle, isDark } = useTheme();

  // Page title from path
  const pageTitle = getPageTitle(location.pathname);

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
        <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {location.pathname !== '/' && (
            <Link
              to="/"
              className="btn btn-ghost btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
              }}
              title="Back to Home Overview"
            >
              <ArrowLeft size={14} />
              <span>Back to Home</span>
            </Link>
          )}
          <span className="topbar-breadcrumb">{pageTitle}</span>
        </div>
        <div className="topbar-right">
          {onOpen3D && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={onOpen3D}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 12px',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                borderRadius: 'var(--radius-full)',
              }}
              title="Experience 3D Smart Home & Appliances"
            >
              <Sparkles size={14} style={{ color: 'var(--color-accent)' }} />
              <span>3D Home</span>
            </button>
          )}
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
      <header
        className="mobile-topbar"
        aria-label="Mobile navigation"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 60,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          background: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.85)',
          borderBottom: isDark
            ? '1px solid rgba(255,255,255,0.08)'
            : '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 1px 12px rgba(0,0,0,0.1)',
        }}
      >
        {/* Left: App Title */}
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: '1.1rem',
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          Home Auto
        </span>

        {/* Right: 3D button, BT badge, theme toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {onOpen3D && (
            <button
              onClick={onOpen3D}
              title="3D Smart Home & Appliances"
              aria-label="Open 3D Home"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: 'none',
                background: isDark
                  ? 'rgba(16,185,129,0.15)'
                  : 'rgba(16,185,129,0.1)',
                color: '#10b981',
                cursor: 'pointer',
                transition: 'background 150ms ease, transform 150ms ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
              }}
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

      {/* === Main Content === */}
      <main
        className={`main-content page-enter ${collapsed ? 'sidebar-collapsed' : ''}`}
        id="main-content"
        aria-label="Page content"
        style={{
          // Mobile overrides are via CSS; inline for safety
        }}
      >
        {children}
      </main>

      {/* === Bottom Nav (mobile) — Floating Pill === */}
      <nav
        className="bottom-nav"
        aria-label="Bottom navigation"
        style={{
          position: 'fixed',
          bottom: 16,
          left: 12,
          right: 12,
          zIndex: 200,
          borderRadius: 28,
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          background: navBg,
          border: navBorder,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.1)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
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
            padding: '10px 4px 10px',
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
                padding: '4px 14px',
                borderRadius: 20,
                textDecoration: 'none',
                color: isActive ? '#10b981' : 'var(--color-text-secondary)',
                transition: 'color 200ms ease',
                minWidth: 52,
                position: 'relative',
                zIndex: 1,
              })}
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={22}
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
    '/electricity': 'Electricity Consumption',
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
