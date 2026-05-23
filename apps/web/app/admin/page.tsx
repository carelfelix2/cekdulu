import type { Metadata } from 'next';
import { Card } from '@/components/ui/card';
import { SectionHeading } from '@/components/section-heading';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Panel admin CekDulu untuk monitoring produk, scraper, analytics, dan RBAC.'
};

const metrics = [
  ['Total produk', '2.4M'],
  ['Affiliate clicks', '84.2K'],
  ['Queue depth', '1.2K'],
  ['Error rate', '0.18%']
];

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Admin"
        title="Admin dashboard"
        description="CRUD, scraper monitoring, queue monitoring, analytics, product merge, dan score adjustment."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([label, value]) => (
          <Card key={label} className="p-5">
            <div className="text-sm text-slate-500">{label}</div>
            <div className="mt-2 text-3xl font-black tracking-tight text-slate-950">{value}</div>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-6">
          <div className="text-sm font-semibold text-slate-900">Scraping monitoring</div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"><span>Shopee</span><span className="font-semibold text-emerald-600">Aktif</span></div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"><span>Tokopedia</span><span className="font-semibold text-emerald-600">Aktif</span></div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"><span>TikTok Shop</span><span className="font-semibold text-amber-600">Queue</span></div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"><span>Lazada</span><span className="font-semibold text-slate-500">Dormant</span></div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-sm font-semibold text-slate-900">RBAC & content ops</div>
          <div className="mt-4 grid gap-3 text-sm text-slate-600">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">Role: Superadmin, Admin, Editor, Analyst, Operator</div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">CRUD products, categories, brands, marketplaces, articles, deals</div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">Worth it score override & product merge workflow</div>
          </div>
        </Card>
      </div>
    </main>
  );
}
