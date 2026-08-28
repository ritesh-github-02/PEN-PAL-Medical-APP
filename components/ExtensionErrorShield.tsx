'use client';

import { useEffect } from 'react';

/**
 * ExtensionErrorShield
 * Prevents third-party Chrome extensions (e.g. screen readers, password managers, AI assistants)
 * from crashing the React/Next.js application or showing runtime error overlays when an extension
 * content-script message times out.
 */
export default function ExtensionErrorShield() {
  useEffect(() => {
    const isExtensionError = (message: string, stack: string, filename: string) => {
      return (
        filename.includes('chrome-extension://') ||
        filename.includes('moz-extension://') ||
        stack.includes('chrome-extension://') ||
        stack.includes('moz-extension://') ||
        message.includes('chrome-extension://') ||
        message.includes('chrome: call method') ||
        message.includes('Extension context invalidated') ||
        message.includes('message channel closed')
      );
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message = typeof reason === 'string' ? reason : reason?.message || '';
      const stack = reason?.stack || '';
      const filename = reason?.fileName || '';

      if (isExtensionError(message, stack, filename)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    const handleError = (event: ErrorEvent) => {
      const filename = event.filename || '';
      const message = event.message || '';
      const stack = event.error?.stack || '';

      if (isExtensionError(message, stack, filename)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection, { capture: true });
    window.addEventListener('error', handleError, { capture: true });

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, { capture: true });
      window.removeEventListener('error', handleError, { capture: true });
    };
  }, []);

  return null;
}
