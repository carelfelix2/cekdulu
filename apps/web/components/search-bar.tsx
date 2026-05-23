'use client';

import { useMemo } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSearchStore } from '@/stores/use-search-store';
import { featuredProducts } from '@/lib/mock-data';

export function SearchBar() {
  const router = useRouter();
  const query = useSearchStore((state) => state.query);
  const setQuery = useSearchStore((state) => state.setQuery);

  const suggestions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return featuredProducts.slice(0, 4);
    return featuredProducts.filter((product) => product.name.toLowerCase().includes(normalized)).slice(0, 4);
  }, [query]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-soft">
      <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari iPhone, Samsung, laptop, TWS..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
      </div>
      {suggestions.length > 0 ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {suggestions.map((product) => (
            <button
              key={product.id}
              onClick={() => router.push(`/products/${product.slug}`)}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              {product.name}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
