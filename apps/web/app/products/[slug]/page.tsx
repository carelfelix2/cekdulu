import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Clock3, Star } from 'lucide-react';
import { featuredProducts } from '@/lib/mock-data';
import { formatIDR } from '@/lib/utils';
import { ComparisonTable } from '@/components/comparison-table';
import { WorthItCard } from '@/components/worth-it-card';
import { SeoJsonLd } from '@/components/seo-jsonld';

function getProduct(slug: string) {
  return featuredProducts.find((product) => product.slug === slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: 'Produk tidak ditemukan' };
  return {
    title: product.name,
    description: `Harga terbaik ${product.name} di marketplace Indonesia.`,
    alternates: {
      canonical: `/products/${product.slug}`
    },
    openGraph: {
      title: product.name,
      description: `Cek harga ${product.name} dan bandingkan marketplace.`
    }
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: [product.imageUrl],
    description: `${product.name} di CekDulu`,
    brand: product.brand,
    offers: product.marketplaces.map((marketplace) => ({
      '@type': 'Offer',
      priceCurrency: 'IDR',
      price: marketplace.price,
      availability: 'https://schema.org/InStock',
      url: `/products/${product.slug}`
    }))
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Beranda', item: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000' },
      { '@type': 'ListItem', position: 2, name: 'Produk', item: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/products` },
      { '@type': 'ListItem', position: 3, name: product.name, item: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/products/${product.slug}` }
    ]
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SeoJsonLd data={productSchema} />
      <SeoJsonLd data={breadcrumbSchema} />
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-900">Beranda</Link>
            <span>→</span>
            <span>{product.category}</span>
          </div>
          <div className="mt-4 grid gap-6 md:grid-cols-[320px_1fr]">
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-slate-100">
              <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
            </div>
            <div>
              <div className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">{product.category}</div>
              <h1 className="mt-3 font-[var(--font-jakarta)] text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">{product.name}</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Rekomendasi produk paling worth it dengan optimasi SEO, affiliate tracking, price history, dan perbandingan marketplace.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-1.5 font-semibold text-slate-900"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {product.rating}</div>
                <div>{product.reviewCount.toLocaleString('id-ID')} review</div>
                <div>{product.soldCount} terjual</div>
                <div className="flex items-center gap-1.5"><Clock3 className="h-4 w-4" /> Update 2 menit lalu</div>
              </div>

              <div className="mt-8 rounded-3xl bg-slate-50 p-5">
                <div className="text-sm text-slate-500">Harga mulai dari</div>
                <div className="mt-1 text-3xl font-black tracking-tight text-orange-500">{formatIDR(product.price)}</div>
                <div className="mt-1 text-sm text-slate-500 line-through">{formatIDR(product.originalPrice)}</div>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <WorthItCard product={product} />
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <div className="text-sm font-semibold text-slate-900">Quick actions</div>
            <div className="mt-4 grid gap-3">
              <Link href={`/compare/${product.slug}`} className="inline-flex items-center justify-between rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white">
                Compare marketplace <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/deals" className="inline-flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800">
                Lihat deals terbaik <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </aside>
      </div>

      <section className="mt-10">
        <ComparisonTable product={product} />
      </section>
    </main>
  );
}
