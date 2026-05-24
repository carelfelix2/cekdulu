'use client';

import Link from 'next/link';
import { Search, Menu, LogOut, Settings, User } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SiteHeader() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const isAdmin = (user?.roles ?? []).some((role) => role === 'ADMIN' || role === 'SUPER_ADMIN');

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    router.push('/');
  };

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
          {!isLoading && isAuthenticated ? (
            <>
              <Link className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white hover:shadow-sm" href="/dashboard">Dashboard</Link>
              {isAdmin && (
                <Link className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white hover:shadow-sm" href="/admin">Admin</Link>
              )}
            </>
          ) : null}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:inline-flex">
            <Search className="mr-2 h-4 w-4" /> Cari
          </Button>

          {isLoading ? (
            <div className="h-9 w-24 animate-pulse rounded-full bg-slate-200" />
          ) : isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex h-9 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                <User className="mr-2 h-4 w-4" />
                {user.name}
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg">
                  <div className="border-b border-slate-200 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <User className="h-4 w-4" />
                    Dashboard
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Settings className="h-4 w-4" />
                      Admin Panel
                    </Link>
                  )}
                  <Link
                    href="/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Settings className="h-4 w-4" />
                    Pengaturan
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-slate-200"
                  >
                    <LogOut className="h-4 w-4" />
                    Keluar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="hidden sm:inline-flex h-9 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                Masuk
              </Link>
              <Link href="/auth/register" className="hidden sm:inline-flex h-9 items-center justify-center rounded-full bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800">
                Daftar
              </Link>
            </>
          )}

          <Button variant="outline" size="sm" className="lg:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
