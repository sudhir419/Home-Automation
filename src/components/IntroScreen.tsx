// Intro / splash screen with classical styling & smooth typography animations
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface Props {
  onDone: () => void;
}

export default function IntroScreen({ onDone }: Props) {
  const [exiting, setExiting] = useState(false);

  // User explicitly requested: Only enter when clicking the "Enter Residence" button (no auto-timeout)
  function handleDone() {
    if (exiting) return;
    setExiting(true);
    setTimeout(onDone, 520);
  }

  return (
    <div
      className={`intro-screen ${exiting ? 'exiting' : ''}`}
      role="region"
      aria-label="Welcome to Home Automation"
    >
      <div className="intro-badge">
        <span>Autonomous Bluetooth Living</span>
      </div>

      {/* Classical Architectural Emblem */}
      <div className="intro-logo-mark">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 10.5L12 3l9 7.5v9.75a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 20.25V10.5z" />
          <path d="M9 21v-7.5h6V21" />
          <circle cx="12" cy="8.5" r="1.2" fill="currentColor" />
        </svg>
      </div>

      {/* Title with editorial serifs */}
      <div className="intro-title-wrap">
        <div className="intro-title">
          <h1>
            Home <span>Automation</span>
          </h1>
        </div>
      </div>

      <p className="intro-subtitle">
        Smart Living &middot; Simple Control
      </p>

      <div className="intro-divider" />

      {/* Simplified, clean statement as requested */}
      <p className="intro-desc" style={{ fontSize: '1.05rem', maxWidth: 360, color: 'var(--color-text-secondary)' }}>
        Direct, secure Bluetooth control for your home appliances. Completely offline.
      </p>

      <div className="intro-actions" style={{ marginTop: 'var(--space-4)' }}>
        <button
          className="btn btn-primary btn-lg"
          onClick={handleDone}
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-base)',
            letterSpacing: '0.04em',
            padding: '14px 36px',
            boxShadow: '0 8px 24px var(--color-blue-glow)',
            borderRadius: 'var(--radius-full)',
            cursor: 'pointer'
          }}
          aria-label="Enter the residence dashboard"
        >
          <span>Enter Residence</span>
          <ArrowRight size={17} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
