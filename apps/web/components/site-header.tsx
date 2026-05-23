import Link from 'next/link';
import { Search, Menu } from 'lucide-react';
import { Button } from './ui/button';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-sm font-black text-white shadow-soft">
            CD
          </div>
          <div>
            <div className="font-[var(--font-jakarta)] text-lg font-extrabold tracking-tight text-slate-900">
              Cek<span className="text-orange-500">Dulu</span>
            </div>
            <div className="text-xs text-slate-500">Affiliate price comparison</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1 lg:flex">
          <Link className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white hover:shadow-sm" href="/products/iphone-15-128gb">Produk</Link>
          <Link className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white hover:shadow-sm" href="/compare/iphone-15-128gb">Compare</Link>
          <Link className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white hover:shadow-sm" href="/deals">Deals</Link>
          <Link className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white hover:shadow-sm" href="/articles/iphone-vs-samsung-worth-it">Artikel</Link>
          <Link className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white hover:shadow-sm" href="/admin">Admin</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:inline-flex">
            <Search className="mr-2 h-4 w-4" /> Cari
          </Button>
          <Link href="/auth/login" className="hidden sm:inline-flex h-9 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50">
            Masuk
          </Link>
          <Link href="/auth/register" className="hidden sm:inline-flex h-9 items-center justify-center rounded-full bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800">
            Daftar
          </Link>
          <Button variant="outline" size="sm" className="lg:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
