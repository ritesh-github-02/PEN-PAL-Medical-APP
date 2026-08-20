'use client';

import { useEffect } from 'react';
import { useUserTracking } from '@/hooks/useUserTracking';

interface ControlTrackerProps {
  locale: string;
}

export default function ControlTracker({ locale }: ControlTrackerProps) {
  const { logEvent, flushActiveDuration } = useUserTracking({
    stepId: 'control_baseline_page',
    stepIndex: 0,
    path: `/${locale}/control`,
    autoHeartbeat: true,
    heartbeatIntervalMs: 20000,
    trackedSections: [
      'section-why-it-matters',
      'section-did-you-know',
      'section-infographic',
      'section-take-challenge',
      'section-delayed-reactions',
      'section-completion',
    ],
  });

  // Log initial entry
  useEffect(() => {
    logEvent('CONTROL_PAGE_ENTER', {
      locale,
      timestamp: new Date().toISOString(),
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      screenResolution: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '',
    });
  }, [locale, logEvent]);

  return null;
}
