import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { featuredProducts } from '@/lib/mock-data';
import { ComparisonTable } from '@/components/comparison-table';
import { WorthItCard } from '@/components/worth-it-card';
import { SectionHeading } from '@/components/section-heading';

function getProduct(slug: string) {
  return featuredProducts.find((product) => product.slug === slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  return {
    title: product ? `Comparison ${product.name}` : 'Comparison',
    description: 'Marketplace comparison page for Indonesia price tracking.',
    alternates: {
      canonical: product ? `/compare/${product.slug}` : '/compare'
    }
  };
}

export default async function ComparePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Comparison"
        title={`Bandingkan ${product.name}`}
        description="Lihat harga, cashback, status stok, dan rekomendasi marketplace terbaik secara real-time."
      />
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <ComparisonTable product={product} />
        <div className="space-y-6">
          <WorthItCard product={product} />
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <div className="text-sm font-semibold text-slate-900">Internal links</div>
            <div className="mt-4 grid gap-3 text-sm">
              <Link href={`/products/${product.slug}`} className="rounded-2xl bg-slate-50 px-4 py-3 font-semibold text-slate-800">Product detail</Link>
              <Link href="/articles/iphone-vs-samsung-worth-it" className="rounded-2xl bg-slate-50 px-4 py-3 font-semibold text-slate-800">SEO article</Link>
              <Link href="/deals" className="rounded-2xl bg-slate-50 px-4 py-3 font-semibold text-slate-800">Deal aggregation</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
