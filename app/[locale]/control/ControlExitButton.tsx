'use client';

import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { logout } from '../intervention/actions';

interface ControlExitButtonProps {
  locale: string;
}

export default function ControlExitButton({ locale }: ControlExitButtonProps) {
  const [closing, setClosing] = useState(false);
  const isEs = locale === 'es';

  const handleExit = async () => {
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

    // 2. Clear authentication cookies via server action
    try {
      logout().catch(() => {});
    } catch {}

    // 3. Close the browser window/tab
    setTimeout(() => {
      window.open('', '_self', '');
      window.close();

      // Fallback if browser security sandbox prevents closing top-level window
      setTimeout(() => {
        window.location.href = 'about:blank';
      }, 350);
    }, 150);
  };

  return (
    <button
      type="button"
      onClick={handleExit}
      disabled={closing}
      aria-label={isEs ? "Finalizar y Salir" : "Finish and Exit"}
      className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2 active:scale-95"
    >
      <LogOut className="w-4 h-4 text-teal-400" aria-hidden="true" />
      <span>{closing ? (isEs ? "Cerrando..." : "Closing...") : (isEs ? "Finalizar y Salir" : "Finish and Exit")}</span>
    </button>
  );
}
