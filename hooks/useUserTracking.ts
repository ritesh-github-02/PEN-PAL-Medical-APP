'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UseUserTrackingOptions {
  stepId: string;
  stepIndex?: number;
  path: string;
  autoHeartbeat?: boolean;
  heartbeatIntervalMs?: number;
  trackedSections?: string[]; // IDs of elements to track via IntersectionObserver
}

export function useUserTracking({
  stepId,
  stepIndex = 0,
  path,
  autoHeartbeat = true,
  heartbeatIntervalMs = 25000,
  trackedSections = [],
}: UseUserTrackingOptions) {
  const startTimeRef = useRef<number>(Date.now());
  const activeDurationMsRef = useRef<number>(0);
  const isVisibleRef = useRef<boolean>(true);
  const lastActiveTimestampRef = useRef<number>(Date.now());
  const observedSectionsRef = useRef<Set<string>>(new Set());

  // Send beacon or fetch to tracking endpoint
  const sendTrackingData = useCallback((payload: Record<string, any>, useBeacon = false) => {
    try {
      const data = JSON.stringify({
        ...payload,
        path,
      });

      if (useBeacon && typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const blob = new Blob([data], { type: 'application/json' });
        navigator.sendBeacon('/api/tracking', blob);
        return;
      }

      fetch('/api/tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data,
        keepalive: true,
      }).catch(() => {});
    } catch (err) {
      console.error('Tracking dispatch error', err);
    }
  }, [path]);

  // Log specific interaction event
  const logEvent = useCallback((eventType: string, eventData?: any) => {
    sendTrackingData({
      eventType,
      eventData,
    });
  }, [sendTrackingData]);

  // Flush accumulated active time
  const flushActiveDuration = useCallback((useBeacon = false, isComplete = false) => {
    const now = Date.now();
    if (isVisibleRef.current) {
      const delta = now - lastActiveTimestampRef.current;
      if (delta > 0 && delta < 300000) { // Discard abnormal gaps > 5 min
        activeDurationMsRef.current += delta;
      }
    }
    lastActiveTimestampRef.current = now;

    const uncommittedMs = activeDurationMsRef.current;
    if (uncommittedMs > 100 || isComplete) {
      activeDurationMsRef.current = 0;
      sendTrackingData({
        stepId,
        stepIndex,
        durationMs: uncommittedMs,
        isComplete,
      }, useBeacon);
    }
  }, [sendTrackingData, stepId, stepIndex]);

  // Handle visibility changes (pause active time when user switches tabs)
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      if (!isVisible) {
        // Tab hidden -> flush time so far and pause
        flushActiveDuration(true);
        isVisibleRef.current = false;
        logEvent('TAB_HIDDEN', { stepId, timestamp: new Date().toISOString() });
      } else {
        // Tab resumed -> resume timer
        isVisibleRef.current = true;
        lastActiveTimestampRef.current = Date.now();
        logEvent('TAB_VISIBLE', { stepId, timestamp: new Date().toISOString() });
      }
    };

    const handleBeforeUnload = () => {
      flushActiveDuration(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
      flushActiveDuration(false);
    };
  }, [flushActiveDuration, logEvent, stepId]);

  // Auto periodic heartbeat
  useEffect(() => {
    if (!autoHeartbeat) return;

    const interval = setInterval(() => {
      flushActiveDuration(false);
    }, heartbeatIntervalMs);

    return () => clearInterval(interval);
  }, [autoHeartbeat, flushActiveDuration, heartbeatIntervalMs]);

  // Section Intersection Observer for scroll telemetry
  useEffect(() => {
    if (!trackedSections || trackedSections.length === 0 || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
            const sectionId = entry.target.id;
            if (sectionId && !observedSectionsRef.current.has(sectionId)) {
              observedSectionsRef.current.add(sectionId);
              logEvent('SECTION_VIEWED', {
                sectionId,
                stepId,
                timestamp: new Date().toISOString(),
              });
            }
          }
        });
      },
      {
        threshold: [0.4],
      }
    );

    trackedSections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [trackedSections, logEvent, stepId]);

  return {
    logEvent,
    flushActiveDuration,
  };
}
