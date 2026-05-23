import Link from 'next/link';
import { Card } from './ui/card';

export function ArticleCard({ article }: { article: { slug: string; title: string; category: string; publishedAt: string; readTime: string } }) {
  return (
    <Card className="p-5 transition hover:-translate-y-1 hover:shadow-card">
      <Link href={`/articles/${article.slug}`}>
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500">{article.category}</div>
        <h3 className="mt-3 text-lg font-extrabold tracking-tight text-slate-900">{article.title}</h3>
        <div className="mt-4 text-sm text-slate-500">{article.publishedAt} · {article.readTime}</div>
      </Link>
    </Card>
  );
}
