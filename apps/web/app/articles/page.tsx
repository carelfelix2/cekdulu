import type { Metadata } from 'next';
import { trendingArticles } from '@/lib/mock-data';
import { SectionHeading } from '@/components/section-heading';
import { ArticleCard } from '@/components/article-card';

export const metadata: Metadata = {
  title: 'Articles',
  description: 'Artikel SEO, review, dan tips belanja hemat di CekDulu.'
};

export default function ArticlesPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="SEO article"
        title="Artikel, review, dan panduan belanja"
        description="Bangun authority organik dengan topik yang berkaitan langsung ke halaman produk dan comparison."
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {trendingArticles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </main>
  );
}
