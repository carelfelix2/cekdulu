import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SeoJsonLd } from '@/components/seo-jsonld';
import { trendingArticles } from '@/lib/mock-data';

function getArticle(slug: string) {
  return trendingArticles.find((article) => article.slug === slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  return {
    title: article ? article.title : 'Artikel',
    description: article ? `${article.title} di CekDulu` : 'SEO article page',
    alternates: {
      canonical: article ? `/articles/${article.slug}` : '/articles'
    }
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    datePublished: article.publishedAt,
    author: { '@type': 'Organization', name: 'CekDulu' }
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Apakah artikel ini terkait halaman produk?',
        acceptedAnswer: { '@type': 'Answer', text: 'Ya, setiap artikel dibuat untuk mendukung internal linking ke produk dan comparison page.' }
      },
      {
        '@type': 'Question',
        name: 'Apakah konten ini SEO friendly?',
        acceptedAnswer: { '@type': 'Answer', text: 'Ya, konten dirancang untuk metadata dinamis, schema markup, dan internal linking.' }
      }
    ]
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <SeoJsonLd data={articleSchema} />
      <SeoJsonLd data={faqSchema} />
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-10">
        <div className="text-xs font-bold uppercase tracking-[0.22em] text-orange-500">{article.category}</div>
        <h1 className="mt-4 font-[var(--font-jakarta)] text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">{article.title}</h1>
        <div className="mt-4 text-sm text-slate-500">{article.publishedAt} · {article.readTime}</div>
        <div className="prose prose-slate mt-8 max-w-none">
          <p>
            Artikel ini menjadi bagian dari strategi SEO CekDulu untuk menangkap demand belanja cerdas, perbandingan harga, dan topik rekomendasi produk.
          </p>
          <h2>Kenapa artikel ini penting</h2>
          <p>
            Internal linking diarahkan ke halaman produk, comparison, dan deal agar crawlability tinggi dan user journey lebih pendek.
          </p>
          <h2>Rekomendasi</h2>
          <p>
            Fokus pada kategori dengan conversion tinggi seperti smartphone, laptop, audio, dan kebutuhan rumah tangga.
          </p>
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/products/iphone-15-128gb" className="rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white">Lihat produk</Link>
          <Link href="/compare/iphone-15-128gb" className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-800">Bandingkan harga</Link>
        </div>
      </div>
    </main>
  );
}
