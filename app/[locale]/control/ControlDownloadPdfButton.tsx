'use client';

import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { generateControlGroupPDF } from '@/lib/generate-control-pdf';

export default function ControlDownloadPdfButton({ locale, label }: { locale?: string; label?: string }) {
  const isEs = locale === 'es';
  const displayLabel = label || (isEs ? 'Descargar Folleto (PDF)' : 'Download Handout (PDF)');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      await generateControlGroupPDF(locale || 'en');
    } catch (err) {
      console.error('Failed to generate control handout PDF:', err);
      // Fallback to window.print if client PDF generation fails
      window.print();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isGenerating}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#128a96] hover:bg-[#0e747e] active:scale-[0.98] text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer no-print focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 disabled:opacity-75"
      aria-label={isEs ? "Descargar folleto educativo en PDF" : "Download educational handout PDF"}
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>{isEs ? "Generando PDF..." : "Downloading PDF..."}</span>
        </>
      ) : (
        <>
          <Download className="w-3.5 h-3.5" />
          <span>{displayLabel}</span>
        </>
      )}
    </button>
  );
}
