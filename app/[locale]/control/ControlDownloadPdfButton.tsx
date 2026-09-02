'use client';

import React from 'react';
import { Download, FileText } from 'lucide-react';

export default function ControlDownloadPdfButton({ locale, label }: { locale?: string; label?: string }) {
  const isEs = locale === 'es';
  const displayLabel = label || (isEs ? 'Descargar Folleto (PDF)' : 'Download Handout (PDF)');

  const handleDownload = () => {
    window.print();
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#128a96] hover:bg-[#0e747e] active:scale-[0.98] text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer no-print focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
      aria-label={isEs ? "Descargar o imprimir folleto educativo en PDF" : "Download or print educational handout PDF"}
    >
      <Download className="w-3.5 h-3.5" />
      <span>{displayLabel}</span>
    </button>
  );
}
