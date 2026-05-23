import type { Metadata } from 'next';
import { featuredProducts } from '@/lib/mock-data';
import { SectionHeading } from '@/components/section-heading';
import { ProductCard } from '@/components/product-card';

export const metadata: Metadata = {
  title: 'Products',
  description: 'Daftar produk paling worth it di CekDulu.'
};

export default function ProductsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Product listing"
        title="Semua produk terbaik"
        description="Listing lengkap untuk pencarian, filter kategori, dan discovery produk paling worth it."
      />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {featuredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}
