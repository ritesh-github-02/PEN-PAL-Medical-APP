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

    const isChunkError = (message: string) => {
      return (
        message.includes('Loading chunk') ||
        message.includes('ChunkLoadError') ||
        message.includes('Failed to fetch dynamically imported module')
      );
    };

    const handleChunkRecovery = (message: string, event: Event) => {
      if (isChunkError(message)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        try {
          const lastReload = sessionStorage.getItem('chunk_retry_shield');
          const now = Date.now();
          if (!lastReload || now - Number(lastReload) > 8000) {
            sessionStorage.setItem('chunk_retry_shield', String(now));
            window.location.reload();
          }
        } catch {}
        return true;
      }
      return false;
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message = typeof reason === 'string' ? reason : reason?.message || '';
      const stack = reason?.stack || '';
      const filename = reason?.fileName || '';

      if (handleChunkRecovery(message, event)) return;
      if (isExtensionError(message, stack, filename)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    const handleError = (event: ErrorEvent) => {
      const filename = event.filename || '';
      const message = event.message || '';
      const stack = event.error?.stack || '';

      if (handleChunkRecovery(message, event)) return;
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
