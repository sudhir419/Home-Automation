// Intro / splash screen — premium mobile-first with staggered entrance animations
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
      className={`intro-screen intro-bg ${exiting ? 'exiting' : ''}`}
      role="region"
      aria-label="Welcome to Home Automation"
    >
      {/* Inner content wrapper — centered, max-width 400px, safe-area padding */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: 400,
          margin: '0 auto',
          padding: '0 24px',
          paddingTop: 'env(safe-area-inset-top, 24px)',
          paddingBottom: 'env(safe-area-inset-bottom, 24px)',
          gap: 0,
          textAlign: 'center',
        }}
      >
        {/* Badge: "Smart Living System" pill */}
        <div
          className="intro-badge"
          style={{ animation: 'card-appear 0.4s 0.1s both' }}
        >
          <span>Smart Living System</span>
        </div>

        {/* Logo mark — 56px, with glow ring */}
        <div
          className="intro-logo-mark"
          style={{
            width: 56,
            height: 56,
            animation: 'card-appear 0.4s 0.2s both',
            marginTop: 20,
          }}
        >
          <svg
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 10.5L12 3l9 7.5v9.75a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 20.25V10.5z" />
            <path d="M9 21v-7.5h6V21" />
            <circle cx="12" cy="8.5" r="1.2" fill="currentColor" />
          </svg>
        </div>

        {/* Title: "Home" / "Automation" on separate lines */}
        <div
          className="intro-title-wrap"
          style={{ animation: 'card-appear 0.5s 0.3s both', marginTop: 24 }}
        >
          <div className="intro-title">
            <h1>
              Home
              <br />
              <span>Automation</span>
            </h1>
          </div>
        </div>

        {/* Subtitle */}
        <p
          className="intro-subtitle"
          style={{ animation: 'card-appear 0.4s 0.5s both', marginTop: 12 }}
        >
          Smart Living &middot; Simple Control
        </p>

        {/* CTA button — full-width on mobile, max 320px, pill shape */}
        <div
          className="intro-actions"
          style={{
            marginTop: 36,
            width: '100%',
            maxWidth: 320,
            animation: 'card-appear 0.4s 0.7s both',
          }}
        >
          <button
            className="btn btn-primary btn-lg"
            onClick={handleDone}
            style={{
              width: '100%',
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-base)',
              letterSpacing: '0.04em',
              padding: '15px 36px',
              boxShadow: '0 8px 24px var(--color-blue-glow)',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
            aria-label="Enter the residence dashboard"
          >
            <span>Enter Residence</span>
            <ArrowRight size={17} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
