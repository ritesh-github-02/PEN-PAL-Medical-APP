'use client';

import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

export default function ControlDownloadPdfButton({ locale, label }: { locale?: string; label?: string }) {
  const isEs = locale === 'es';
  const displayLabel = label || (isEs ? 'Descargar Folleto (PDF)' : 'Download Handout (PDF)');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const fileName = isEs
        ? 'PEN-PAL_Folleto_Familiar_Grupo_Control.pdf'
        : 'PEN-PAL_Control_Group_Family_Handout.pdf';
      const fileUrl = `/documents/${fileName}`;

      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.statusText}`);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Failed to download control handout PDF:', err);
      window.open(isEs ? '/documents/PEN-PAL_Folleto_Familiar_Grupo_Control.pdf' : '/documents/PEN-PAL_Control_Group_Family_Handout.pdf', '_blank');
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
          <span>{isEs ? "Descargando..." : "Downloading..."}</span>
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
