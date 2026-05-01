'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export function UserSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (query) {
      params.set('q', query);
    } else {
      params.delete('q');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="bg-white border border-teal-100 p-4 space-y-4 shadow-sm">
      <div className="space-y-1">
        <h3 className="text-xs font-bold text-teal-400 uppercase tracking-wider">Search Participant</h3>
        <p className="text-sm font-light tracking-tight">Lookup research IDs</p>
      </div>
      
      <form onSubmit={handleSearch} className="flex gap-3">
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter Research ID (externalId)..."
          className="flex-1 px-3 py-2 border border-teal-100 bg-teal-50 focus:bg-white focus:border-teal-300 focus:outline-none transition-all font-light"
        />
        <button 
          type="submit"
          className="px-4 py-2 bg-teal-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-teal-700 transition-colors"
        >
          Search
        </button>
      </form>
    </div>
  );
}