'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { logout } from '../intervention/actions';

interface ControlExitButtonProps {
  locale: string;
  className?: string;
  label?: string;
}

export default function ControlExitButton({ 
  locale, 
  className,
  label 
}: ControlExitButtonProps) {
  const [closing, setClosing] = useState(false);
  const isEs = locale === 'es';

  const defaultLabel = label || (isEs ? 'Cerrar' : 'Close');

  const handleClose = async () => {
    setClosing(true);

    try {
      // 1. Send complete session tracking beacon
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const payload = JSON.stringify({
          path: `/${locale}/control`,
          eventType: 'SESSION_COMPLETE',
          eventData: { completedAt: new Date().toISOString() },
          isComplete: true,
        });
        navigator.sendBeacon('/api/tracking', new Blob([payload], { type: 'application/json' }));
      } else {
        await fetch('/api/tracking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: `/${locale}/control`,
            eventType: 'SESSION_COMPLETE',
            isComplete: true,
          }),
          keepalive: true,
        });
      }
    } catch {}

    // 2. Clear authentication cookies in background
    try {
      logout().catch(() => {});
    } catch {}

    // 3. Close the browser window/tab
    setTimeout(() => {
      window.open('', '_self', '');
      window.close();

      // Fallback if browser security sandbox prevents closing top-level tab
      setTimeout(() => {
        window.location.href = 'about:blank';
      }, 350);
    }, 150);
  };

  return (
    <button
      type="button"
      onClick={handleClose}
      disabled={closing}
      aria-label={isEs ? 'Cerrar ventana del estudio' : 'Close study window'}
      className={className || "flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-rose-900/50 hover:text-rose-200 border border-slate-700 text-slate-100 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"}
    >
      <X className="w-3.5 h-3.5 text-teal-300" aria-hidden="true" />
      <span>{closing ? (isEs ? 'Cerrando...' : 'Closing...') : defaultLabel}</span>
    </button>
  );
}
