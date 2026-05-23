import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white/80">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <div className="font-[var(--font-jakarta)] text-xl font-extrabold tracking-tight text-slate-900">
            Cek<span className="text-orange-500">Dulu</span>
          </div>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
            Platform price comparison, affiliate tracking, dan smart shopping assistant untuk marketplace Indonesia.
          </p>
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900">Platform</div>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li><Link href="/products/iphone-15-128gb">Produk</Link></li>
            <li><Link href="/compare/iphone-15-128gb">Comparison</Link></li>
            <li><Link href="/deals">Deals</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900">Konten</div>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li><Link href="/articles/iphone-vs-samsung-worth-it">Artikel SEO</Link></li>
            <li><Link href="/admin">Admin</Link></li>
            <li><Link href="/sitemap.xml">Sitemap</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
