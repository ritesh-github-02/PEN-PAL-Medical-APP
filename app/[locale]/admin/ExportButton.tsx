'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';

export function ExportButton({ type, label }: { type: 'responses' | 'events' | 'participants'; label?: string }) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      window.location.href = `/api/export?type=${type}`;
    } catch (error) {
      console.error('Export failed', error);
    }
    setTimeout(() => setLoading(false), 1200);
  };

  const defaultLabel = type === 'participants' ? 'Export Roster CSV' : 'Export CSV';

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-all shadow-xs disabled:opacity-50 cursor-pointer"
    >
      <Download className="w-3.5 h-3.5 text-teal-400" />
      {loading ? 'Exporting...' : label || defaultLabel}
    </button>
  );
}