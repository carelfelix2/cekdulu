import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Admin Panel',
  description: 'Panel admin CekDulu untuk kontrol konten, scraping, analytics, dan role management.'
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-slate-950 text-white">{children}</div>;
}