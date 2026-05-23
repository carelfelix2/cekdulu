'use client';

import Link from 'next/link';
import { Bell, Heart, LayoutGrid, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

const userHighlights = [
  { label: 'Wishlist aktif', value: '18' },
  { label: 'Price alerts', value: '6' },
  { label: 'Saved comparison', value: '24' },
  { label: 'Voucher siap pakai', value: '11' }
];

const userFeatures = [
  {
    icon: Heart,
    title: 'Wishlist & favorit',
    description: 'Simpan produk yang ingin dipantau harga dan performanya.'
  },
  {
    icon: Bell,
    title: 'Notifikasi harga',
    description: 'Dapatkan alert saat harga turun atau stok kembali tersedia.'
  },
  {
    icon: Search,
    title: 'Riwayat pencarian',
    description: 'Lanjutkan pencarian dari histori dan rekomendasi yang relevan.'
  },
  {
    icon: Sparkles,
    title: 'Rekomendasi personal',
    description: 'Lihat produk, artikel, dan deals yang paling cocok untukmu.'
  }
];

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <div className="py-20 text-center text-slate-500">Memuat user panel...</div>;
  }

  if (!isAuthenticated) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4">
        <Card className="w-full p-8 text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-orange-500" />
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950">User panel</h1>
          <p className="mt-3 text-slate-600">Silakan masuk untuk melihat wishlist, notifikasi harga, dan aktivitas Anda.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/auth/login" className="inline-flex h-11 items-center justify-center rounded-full bg-orange-500 px-5 text-sm font-semibold text-white hover:bg-orange-600">
              Masuk
            </Link>
            <Link href="/auth/register" className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800 hover:bg-slate-50">
              Daftar
            </Link>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="space-y-8">
      <section className="rounded-[2rem] bg-gradient-to-r from-slate-950 via-slate-900 to-orange-600 p-8 text-white shadow-soft">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge className="bg-white/10 text-white">User Panel</Badge>
            <h1 className="mt-4 text-4xl font-black tracking-tight">Halo, {user?.name ?? 'User'}</h1>
            <p className="mt-3 max-w-2xl text-white/75">
              Pantau harga, simpan produk, dan kelola aktivitas belanja tanpa akses admin.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/search" className="inline-flex h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-slate-950 hover:bg-slate-100">
              Mulai cari
            </Link>
            <Link href="/products" className="inline-flex h-11 items-center justify-center rounded-full border border-white/20 px-5 text-sm font-semibold text-white hover:bg-white/10">
              Lihat produk
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {userHighlights.map((item) => (
          <Card key={item.label} className="p-5">
            <div className="text-sm text-slate-500">{item.label}</div>
            <div className="mt-2 text-3xl font-black tracking-tight text-slate-950">{item.value}</div>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-slate-900">Fitur user</div>
              <div className="mt-1 text-sm text-slate-500">Berbeda dari admin panel</div>
            </div>
            <LayoutGrid className="h-5 w-5 text-orange-500" />
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {userFeatures.map((feature) => (
              <div key={feature.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <feature.icon className="h-5 w-5 text-orange-500" />
                <div className="mt-3 font-semibold text-slate-950">{feature.title}</div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-sm font-semibold text-slate-900">Akun aktif</div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span>Email</span>
              <span className="font-semibold text-slate-900">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span>Role</span>
              <span className="font-semibold text-emerald-600">USER</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span>Status</span>
              <span className="font-semibold text-emerald-600">ACTIVE</span>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <Button variant="primary" size="sm">Kelola wishlist</Button>
            <Button variant="outline" size="sm">Atur alert</Button>
          </div>
        </Card>
      </section>
    </main>
  );
}