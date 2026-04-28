'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';

export function ExportButton({ type }: { type: 'responses' | 'events' }) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      window.location.href = `/api/export?type=${type}`;
    } catch (error) {
      console.error('Export failed', error);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all text-sm uppercase tracking-wide disabled:opacity-50 disabled:shadow-none"
    >
      <Download className="w-4 h-4" />
      {loading ? 'Exporting...' : 'Export CSV'}
    </button>
  );
}
