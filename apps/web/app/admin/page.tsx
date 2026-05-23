'use client';

import Link from 'next/link';
import { AlertTriangle, BarChart3, Database, Hammer, Shield, Workflow } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

const adminStats = [
  { label: 'Produk aktif', value: '2.4M' },
  { label: 'Queue scraper', value: '1.2K' },
  { label: 'Events analytics', value: '84.2K' },
  { label: 'Errors', value: '0.18%' }
];

const adminModules = [
  {
    icon: Database,
    title: 'Master data',
    description: 'Kelola user, role, marketplace, brand, kategori, dan produk.'
  },
  {
    icon: Workflow,
    title: 'Scraping orchestration',
    description: 'Monitoring job, retry, queue, dan penjadwalan crawler.'
  },
  {
    icon: BarChart3,
    title: 'Analytics & reporting',
    description: 'Lihat funnel trafik, affiliate click, dan performa harga.'
  },
  {
    icon: Hammer,
    title: 'Content operations',
    description: 'Review artikel, deals, merge produk, dan override score.'
  }
];

export default function AdminPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const roles = user?.roles ?? [];
  const isAdmin = roles.includes('ADMIN') || roles.includes('SUPER_ADMIN');

  if (isLoading) {
    return <div className="py-20 text-center text-white/70">Memuat admin panel...</div>;
  }

  if (!isAuthenticated) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4">
        <Card className="w-full p-8 text-center">
          <Shield className="mx-auto h-12 w-12 text-orange-500" />
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950">Admin panel</h1>
          <p className="mt-3 text-slate-600">Silakan masuk dengan akun admin untuk membuka seluruh kontrol website.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/auth/login" className="inline-flex h-11 items-center justify-center rounded-full bg-orange-500 px-5 text-sm font-semibold text-white hover:bg-orange-600">
              Masuk admin
            </Link>
          </div>
        </Card>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4">
        <Card className="w-full p-8 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-amber-500" />
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950">Akses ditolak</h1>
          <p className="mt-3 text-slate-600">Akun ini hanya bisa masuk ke user panel. Panel admin hanya untuk role ADMIN atau SUPER_ADMIN.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/dashboard" className="inline-flex h-11 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-slate-800">
              Ke user panel
            </Link>
            <Link href="/auth/login" className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800 hover:bg-slate-50">
              Ganti akun
            </Link>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] bg-gradient-to-r from-slate-950 via-slate-900 to-orange-600 p-8 shadow-soft">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge className="bg-white/10 text-white">Admin Panel</Badge>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white">Halo, {user?.name ?? 'Admin'}</h1>
            <p className="mt-3 max-w-2xl text-white/75">
              Pusat kontrol untuk semua data, scraping, artikel, deals, marketplace, dan akses role.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin" className="inline-flex h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-slate-950 hover:bg-slate-100">
              Refresh data
            </Link>
            <Link href="/dashboard" className="inline-flex h-11 items-center justify-center rounded-full border border-white/20 px-5 text-sm font-semibold text-white hover:bg-white/10">
              Lihat user panel
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {adminStats.map((item) => (
          <Card key={item.label} className="p-5 bg-white">
            <div className="text-sm text-slate-500">{item.label}</div>
            <div className="mt-2 text-3xl font-black tracking-tight text-slate-950">{item.value}</div>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-6 bg-white text-slate-900">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-slate-900">Admin modules</div>
              <div className="mt-1 text-sm text-slate-500">Berbeda total dari user panel</div>
            </div>
            <Shield className="h-5 w-5 text-orange-500" />
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {adminModules.map((module) => (
              <div key={module.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <module.icon className="h-5 w-5 text-orange-500" />
                <div className="mt-3 font-semibold text-slate-950">{module.title}</div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{module.description}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-white text-slate-900">
          <div className="text-sm font-semibold text-slate-900">Kontrol cepat</div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span>Access level</span>
              <span className="font-semibold text-emerald-600">ADMIN</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span>Scraper health</span>
              <span className="font-semibold text-emerald-600">Healthy</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span>Database</span>
              <span className="font-semibold text-emerald-600">PostgreSQL ready</span>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <Button variant="secondary" size="sm">Manage users</Button>
            <Button variant="outline" size="sm">Open queue</Button>
          </div>
        </Card>
      </section>
    </main>
  );
}
