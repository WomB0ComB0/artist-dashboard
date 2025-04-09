'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export const BasicSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchTerm) {
      params.set('q', searchTerm);
    } else {
      params.delete('q');
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="relative flex flex-1 flex-shrink-0">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
        className="block w-full rounded-md border border-gray-200 py-2 px-4 text-sm"
      />
      <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2">
        Search
      </button>
    </form>
  );
};
