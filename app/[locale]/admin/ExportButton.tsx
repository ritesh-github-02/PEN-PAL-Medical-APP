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
      className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium shadow shadow-teal-200 transition-all text-xs uppercase tracking-wider disabled:opacity-50 disabled:shadow-none"
    >
      <Download className="w-3 h-3" />
      {loading ? 'Exporting...' : 'Export CSV'}
    </button>
  );
}