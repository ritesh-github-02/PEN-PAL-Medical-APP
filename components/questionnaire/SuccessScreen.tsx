"use client";

import React, { useRef, useEffect } from "react";
import { logout } from "@/app/[locale]/intervention/actions";

export interface SuccessScreenProps {
  locale: string;
  onSwitchLanguage?: (newLocale: string) => void;
  onClose?: () => void;
}

export function SuccessScreen({ locale, onSwitchLanguage, onClose }: SuccessScreenProps) {
  const isSpanish = locale === "es";
  const headingRef = useRef<HTMLHeadingElement>(null);

  // 1. FIX: Update document title and focus the heading after the animation settles (150ms)
  // This ensures VoiceOver captures the heading immediately and stops reading the window description!
  useEffect(() => {
    document.title = isSpanish 
      ? "Sesión completada | PEN-PAL" 
      : "Session Complete | PEN-PAL";

    const timer = setTimeout(() => {
      headingRef.current?.focus();
    }, 150);

    return () => clearTimeout(timer);
  }, [isSpanish]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      try {
        window.close();
      } catch {}
      logout();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 font-sans bg-[#f4f8e8] relative">
      {/* Language Switcher in Top-Right Corner */}
      {onSwitchLanguage && (
        <aside 
          aria-label={isSpanish ? "Seleccionar idioma" : "Language selection"}
          className="absolute top-6 right-6 z-20"
        >
          <div 
            className="flex items-center gap-1 bg-white/90 border border-slate-200/90 shadow-2xs rounded-full p-1 font-sans"
            role="group"
          >
            <button
              type="button"
              onClick={() => onSwitchLanguage("en")}
              aria-pressed={locale === "en"}
              className={`px-3 py-1.5 min-h-[36px] text-xs font-extrabold rounded-full transition-all cursor-pointer flex items-center gap-1 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a] ${
                locale === "en"
                  ? "bg-[#236f7a] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <span aria-hidden="true">🇺🇸</span>
              <span>English</span>
            </button> 
            <button
              type="button"
              onClick={() => onSwitchLanguage("es")}
              aria-pressed={locale === "es"}
              className={`px-3 py-1.5 min-h-[36px] text-xs font-extrabold rounded-full transition-all cursor-pointer flex items-center gap-1 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a] ${
                locale === "es"
                  ? "bg-[#236f7a] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <span aria-hidden="true">🇲🇽</span>
              <span>Español</span>
            </button>
          </div>
        </aside>
      )}

      {/* Main Success Card wrapped in semantic <main> */}
      <main 
        id="main-content" 
        className="max-w-md w-full bg-white border border-slate-200/90 p-8 sm:p-10 text-center shadow-lg rounded-3xl space-y-5 animate-in fade-in duration-150"
      >
        {/* Emerald Checkmark Badge */}
        <div 
          className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto rounded-full text-2xl font-bold shadow-xs select-none"
          aria-hidden="true"
        >
          ✓
        </div>

        {/* Title (Proper H1) & Description */}
        <div className="space-y-2">
          <h1 
            ref={headingRef}
            tabIndex={-1}
            id="success-title"
            className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight outline-none"
          >
            {isSpanish ? "¡Éxito!" : "Success"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            {isSpanish
              ? "Sus respuestas han sido registradas. Gracias por participar en el estudio PEN-PAL."
              : "Your responses have been recorded. Thank you for participating in the PEN-PAL study."}
          </p>
        </div>

        {/* Action Button & Footnote */}
        <div className="space-y-3 pt-6 border-t border-slate-100">
          <button 
            type="button" 
            onClick={handleClose} 
            className="w-full py-3.5 min-h-[44px] bg-[#132338] hover:bg-[#0c1827] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition shadow-sm active:scale-[0.98] cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#236f7a]"
          >
            {isSpanish ? "Cerrar esta ventana" : "Close this window"}
          </button>

          {/* FIX: Elevated contrast to text-slate-600 (5.9:1 WCAG AAA Pass) */}
          <p className="text-[11px] text-slate-600 uppercase tracking-wider font-bold leading-tight">
            {isSpanish 
              ? "La sesión se cerrará • Puede cerrar esta ventana con seguridad" 
              : "Session will be cleared • You may safely close this window"}
          </p>
        </div>
      </main>
    </div>
  );
}

export default SuccessScreen;
