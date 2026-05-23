import type { Metadata } from 'next';
import { SearchBar } from '@/components/search-bar';
import { SectionHeading } from '@/components/section-heading';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search autocomplete dan discovery products CekDulu.'
};

export default function SearchPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Search"
        title="Cari produk, brand, atau kategori"
        description="Gunakan autocomplete untuk menemukan produk paling worth it lebih cepat."
      />
      <SearchBar />
    </main>
  );
}
