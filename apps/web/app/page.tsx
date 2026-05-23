import type { Metadata } from 'next';
import Link from 'next/link';
import { Hero } from '@/components/hero';
import { SectionHeading } from '@/components/section-heading';
import { ProductCard } from '@/components/product-card';
import { ArticleCard } from '@/components/article-card';
import { DealCard } from '@/components/deal-card';
import { featuredProducts, trendingArticles, flashDeals } from '@/lib/mock-data';
import { SeoJsonLd } from '@/components/seo-jsonld';

export const metadata: Metadata = {
  title: 'Homepage',
  description: 'Homepage CekDulu untuk price comparison, deals, dan rekomendasi produk paling worth it.'
};

export default function HomePage() {
  const siteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'CekDulu',
    url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <main>
      <SeoJsonLd data={siteSchema} />
      <Hero />

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Worth it picks"
          title="Produk paling worth it"
          description="Daftar produk dengan score tertinggi berdasarkan harga, rating, review, seller, cashback, dan histori harga."
        />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Deals"
          title="Deal aggregation"
          description="Kurasi flash deal terbaik dari marketplace aktif dengan harga diskon, countdown, dan potensi komisi affiliate."
        />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {flashDeals.map((deal) => (
            <DealCard key={deal.title} deal={deal} />
          ))}
        </div>
        <div className="mt-6">
          <Link href="/deals" className="text-sm font-semibold text-orange-500 hover:text-orange-600">
            Lihat semua deals →
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="SEO content"
          title="Artikel SEO dan internal linking"
          description="Bangun trafik organik dari topik review, perbandingan, dan panduan belanja hemat."
        />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {trendingArticles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
        <div className="mt-6">
          <Link href="/articles/iphone-vs-samsung-worth-it" className="text-sm font-semibold text-orange-500 hover:text-orange-600">
            Baca artikel unggulan →
          </Link>
        </div>
      </section>
    </main>
  );
}
