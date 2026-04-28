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
    <div className="bg-white border border-zinc-200 p-8 space-y-6 shadow-sm">
      <div className="space-y-1">
        <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Search Participant</h3>
        <p className="text-xl font-light tracking-tight">Lookup research IDs</p>
      </div>
      
      <form onSubmit={handleSearch} className="flex gap-4">
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter Research ID (externalId)..."
          className="flex-1 px-6 py-4 border border-zinc-100 bg-zinc-50 focus:bg-white focus:border-zinc-900 focus:outline-none transition-all font-light"
        />
        <button 
          type="submit"
          className="px-10 py-4 bg-zinc-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors"
        >
          Search
        </button>
      </form>
    </div>
  );
}
