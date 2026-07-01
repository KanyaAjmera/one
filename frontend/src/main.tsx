import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import posthog from 'posthog-js'
import './index.css'
import App from './App'

// ── PostHog Analytics ──────────────────────────────────────────────────────────
// Replace the key below with your real PostHog project key from posthog.com
// (free plan: 1M events/month).
// Set VITE_POSTHOG_KEY in .env to enable; if missing, analytics silently no-ops.
const posthogKey = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
if (posthogKey) {
  posthog.init(posthogKey, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
    person_profiles: 'identified_only', // only profile logged-in users
    capture_pageview: true,             // auto-track page navigation
    capture_pageleave: true,            // track when users leave
    session_recording: {
      maskAllInputs: true,              // privacy: mask all form inputs
    },
  });
}
// ──────────────────────────────────────────────────────────────────────────────

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
