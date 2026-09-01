'use client';

import { useEffect, useRef } from 'react';
import { useUserTracking } from '@/hooks/useUserTracking';
import { validateAndConsumeToken } from '../intervention/actions';

interface ControlTrackerProps {
  locale: string;
  token?: string;
}

export default function ControlTracker({ locale, token }: ControlTrackerProps) {
  const initializedRef = useRef(false);

  // Extract token from prop or URL
  let effectiveToken = token;
  if (!effectiveToken && typeof window !== 'undefined') {
    const sp = new URLSearchParams(window.location.search);
    effectiveToken = sp.get('token') || sp.get('TOKEN') || sp.get('t') || undefined;
  }

  const { logEvent, flushActiveDuration } = useUserTracking({
    stepId: 'control_baseline_page',
    stepIndex: 0,
    path: `/${locale}/control`,
    token: effectiveToken,
    autoHeartbeat: true,
    heartbeatIntervalMs: 15000,
    trackedSections: [
      'section-why-it-matters',
      'section-did-you-know',
      'section-infographic',
      'section-take-challenge',
      'section-delayed-reactions',
      'section-completion',
    ],
  });

  // 1. Authenticate token and create active session on mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    async function initSession() {
      if (effectiveToken) {
        try {
          await validateAndConsumeToken(effectiveToken, locale);
        } catch (err) {
          console.warn('Control session token validation error:', err);
        }
      }

      // Log initial entry
      logEvent('CONTROL_PAGE_ENTER', {
        locale,
        token: effectiveToken || 'anonymous',
        timestamp: new Date().toISOString(),
        referrer: typeof document !== 'undefined' ? document.referrer : '',
        screenResolution: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '',
      });
    }

    initSession();
  }, [effectiveToken, locale, logEvent]);

  return null;
}
