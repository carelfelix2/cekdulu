'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Database,
  Hammer,
  LayoutGrid,
  Loader2,
  RefreshCw,
  Shield,
  Sparkles,
  TrendingUp,
  Package,
  Store,
  Link2,
  FileText,
  Search,
  Trash2,
  CheckCircle2,
  XCircle,
  Play,
  Pencil,
  Eye,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

type AnyRecord = Record<string, any>;
type CreateRecordType = 'product' | 'marketplace' | 'affiliate' | 'article' | 'price';
type CreateField = {
  key: string;
  label: string;
  placeholder: string;
  type?: string;
  multiline?: boolean;
};
type CreateFormConfig = Record<CreateRecordType, { title: string; description: string; fields: CreateField[] }>;

const formatCurrency = (value?: number | string | null) => {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
};

const formatDate = (value?: string | Date | null) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
};

const loadOverview = async () => {
  const [dashboard, products, marketplaces, affiliateLinks, articles, scrapingJobs, scrapedProducts, analytics] = await Promise.all([
    apiFetch<AnyRecord>('/dashboard/admin').then((response) => response.data),
    apiFetch<AnyRecord>('/products?page=1&limit=8').then((response) => response.data),
    apiFetch<AnyRecord>('/marketplaces').then((response) => response.data),
    apiFetch<AnyRecord>('/affiliate-links').then((response) => response.data),
    apiFetch<AnyRecord>('/articles').then((response) => response.data),
    apiFetch<AnyRecord>('/scraping/jobs').then((response) => response.data),
    apiFetch<AnyRecord>('/scraped-products').then((response) => response.data),
    apiFetch<AnyRecord>('/analytics/summary').then((response) => response.data)
  ]);

  return { dashboard, products, marketplaces, affiliateLinks, articles, scrapingJobs, scrapedProducts, analytics };
};

export default function AdminPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [scrapeKeyword, setScrapeKeyword] = useState('laptop');
  const [scrapeLimit, setScrapeLimit] = useState('10');
  const [scrapeMarketplaceId, setScrapeMarketplaceId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createModalType, setCreateModalType] = useState<CreateRecordType | null>(null);
  const [createForm, setCreateForm] = useState<Record<string, string>>({});
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);

  const overviewQuery = useQuery({
    queryKey: ['admin-overview'],
    queryFn: loadOverview,
  });

  const isAdmin = useMemo(() => {
    const roles = user?.roles ?? [];
    return roles.includes('ADMIN') || roles.includes('SUPER_ADMIN');
  }, [user?.roles]);

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
  };

  const runScrape = async () => {
    setIsSubmitting(true);
    try {
      await apiFetch('/scraping/run', {
        method: 'POST',
        body: JSON.stringify({ keyword: scrapeKeyword, limit: Number(scrapeLimit), marketplaceId: scrapeMarketplaceId || undefined })
      });
      await refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  const createFormConfig: CreateFormConfig = {
    product: {
      title: 'Create product',
      description: 'Tambahkan produk baru ke katalog utama.',
      fields: [
        { key: 'name', label: 'Product name', placeholder: 'Contoh: iPhone 15 128GB' },
        { key: 'slug', label: 'Slug', placeholder: 'iphone-15-128gb' }
      ]
    },
    marketplace: {
      title: 'Create marketplace',
      description: 'Tambahkan marketplace baru untuk listing harga.',
      fields: [
        { key: 'name', label: 'Marketplace name', placeholder: 'Contoh: Shopee' },
        { key: 'slug', label: 'Slug', placeholder: 'shopee' },
        { key: 'baseUrl', label: 'Base URL', placeholder: 'https://example.com' }
      ]
    },
    affiliate: {
      title: 'Create affiliate link',
      description: 'Hubungkan product ke marketplace melalui link affiliate.',
      fields: [
        { key: 'productId', label: 'Product ID', placeholder: 'cuid product' },
        { key: 'marketplaceId', label: 'Marketplace ID', placeholder: 'cuid marketplace' },
        { key: 'url', label: 'Affiliate URL', placeholder: 'https://...' },
        { key: 'shortCode', label: 'Short code', placeholder: 'IPH15-SHP' },
        { key: 'trackingCode', label: 'Tracking code', placeholder: 'trk_admin_001' }
      ]
    },
    article: {
      title: 'Create article',
      description: 'Buat draft artikel baru untuk konten SEO.',
      fields: [
        { key: 'title', label: 'Article title', placeholder: 'Judul artikel' },
        { key: 'slug', label: 'Slug', placeholder: 'judul-artikel' },
        { key: 'content', label: 'Content', placeholder: 'Tulis konten draft di sini...', multiline: true }
      ]
    },
    price: {
      title: 'Create product price',
      description: 'Tambahkan snapshot harga produk.',
      fields: [
        { key: 'productId', label: 'Product ID', placeholder: 'cuid product' },
        { key: 'marketplaceId', label: 'Marketplace ID', placeholder: 'cuid marketplace' },
        { key: 'price', label: 'Price', placeholder: '1999000', type: 'number' }
      ]
    }
  };

  const openCreateModal = (type: CreateRecordType) => {
    const defaults: Record<string, string> = {
      name: '',
      slug: '',
      baseUrl: 'https://example.com',
      title: '',
      content: 'Draft article content',
      productId: '',
      marketplaceId: '',
      url: '',
      shortCode: '',
      trackingCode: '',
      price: ''
    };
    setCreateForm(defaults);
    setCreateError(null);
    setCreateModalType(type);
  };

  const closeCreateModal = () => {
    if (isCreateSubmitting) return;
    setCreateModalType(null);
    setCreateError(null);
  };

  const onCreateFieldChange = (key: string, value: string) => {
    setCreateForm((prev) => ({ ...prev, [key]: value }));
  };

  const submitCreateForm = async () => {
    if (!createModalType) return;
    setCreateError(null);
    setIsCreateSubmitting(true);

    try {
      if (createModalType === 'product') {
        if (!createForm.name || !createForm.slug) throw new Error('Product name dan slug wajib diisi.');
        await apiFetch('/products', {
          method: 'POST',
          body: JSON.stringify({ name: createForm.name, slug: createForm.slug, status: 'DRAFT', isFeatured: false, isTrending: false, worthItScore: 0 })
        });
      }

      if (createModalType === 'marketplace') {
        if (!createForm.name || !createForm.slug) throw new Error('Marketplace name dan slug wajib diisi.');
        await apiFetch('/marketplaces', {
          method: 'POST',
          body: JSON.stringify({ name: createForm.name, slug: createForm.slug, displayName: createForm.name, baseUrl: createForm.baseUrl || undefined, isActive: true })
        });
      }

      if (createModalType === 'affiliate') {
        if (!createForm.productId || !createForm.marketplaceId || !createForm.url || !createForm.shortCode || !createForm.trackingCode) {
          throw new Error('Semua field affiliate link wajib diisi.');
        }
        await apiFetch('/affiliate-links', {
          method: 'POST',
          body: JSON.stringify({
            productId: createForm.productId,
            marketplaceId: createForm.marketplaceId,
            url: createForm.url,
            shortCode: createForm.shortCode,
            trackingCode: createForm.trackingCode,
            isActive: true
          })
        });
      }

      if (createModalType === 'article') {
        if (!createForm.title || !createForm.slug) throw new Error('Article title dan slug wajib diisi.');
        await apiFetch('/articles', {
          method: 'POST',
          body: JSON.stringify({ title: createForm.title, slug: createForm.slug, content: createForm.content || '', excerpt: createForm.title, status: 'DRAFT' })
        });
      }

      if (createModalType === 'price') {
        if (!createForm.productId || !createForm.marketplaceId || !createForm.price) throw new Error('Product ID, Marketplace ID, dan Price wajib diisi.');
        await apiFetch('/product-prices', {
          method: 'POST',
          body: JSON.stringify({
            productId: createForm.productId,
            marketplaceId: createForm.marketplaceId,
            price: Number(createForm.price),
            discount: 0,
            rating: 0,
            soldCount: 0,
            reviewCount: 0,
            isActive: true
          })
        });
      }

      await refresh();
      setCreateModalType(null);
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Gagal membuat data');
    } finally {
      setIsCreateSubmitting(false);
    }
  };

  const mutateWithConfirm = async (message: string, request: () => Promise<unknown>) => {
    if (!window.confirm(message)) return;
    await request();
    await refresh();
  };

  if (isLoading || overviewQuery.isLoading) {
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

  const data = overviewQuery.data;
  const totals = data?.dashboard?.totals ?? {};
  const analytics = data?.analytics ?? {};

  return (
    <main className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] bg-gradient-to-r from-slate-950 via-slate-900 to-orange-600 p-8 shadow-soft">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge className="bg-white/10 text-white">Admin Panel</Badge>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white">Halo, {user?.name ?? 'Admin'}</h1>
            <p className="mt-3 max-w-2xl text-white/75">
              Pusat kontrol untuk produk, marketplace, affiliate, scraping, artikel, dan analytics.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" className="border-white/20 bg-white text-slate-950 hover:bg-white/90" onClick={() => void refresh()}>
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh data
            </Button>
            <Link href="/dashboard" className="inline-flex h-11 items-center justify-center rounded-full border border-white/20 px-5 text-sm font-semibold text-white hover:bg-white/10">
              Lihat user panel
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total products', value: totals.products ?? 0, icon: Package },
          { label: 'Total marketplaces', value: totals.marketplaces ?? 0, icon: Store },
          { label: 'Affiliate links', value: totals.affiliateLinks ?? 0, icon: Link2 },
          { label: 'Articles', value: totals.articles ?? 0, icon: FileText },
          { label: 'Scraped products', value: totals.scrapedProducts ?? 0, icon: Search },
          { label: 'Affiliate clicks', value: analytics.totalAffiliateClicks ?? 0, icon: BarChart3 },
          { label: 'Scraping jobs', value: analytics.scrapingJobs?.totalJobs ?? 0, icon: Hammer },
          { label: 'Published products', value: analytics.publishedProducts ?? 0, icon: TrendingUp }
        ].map((item) => (
          <Card key={item.label} className="bg-white p-5">
            <div className="flex items-center justify-between gap-3 text-sm text-slate-500">
              <span>{item.label}</span>
              <item.icon className="h-4 w-4 text-orange-500" />
            </div>
            <div className="mt-2 text-3xl font-black tracking-tight text-slate-950">{item.value}</div>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-6 bg-white text-slate-900">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-slate-900">Quick actions</div>
              <div className="mt-1 text-sm text-slate-500">Buat data atau jalankan scraping manual</div>
            </div>
            <Shield className="h-5 w-5 text-orange-500" />
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-900">Run scraping manual</div>
              <div className="mt-3 grid gap-3">
                <input className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none ring-0 focus:border-orange-500" value={scrapeKeyword} onChange={(event) => setScrapeKeyword(event.target.value)} placeholder="Keyword" />
                <input className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none ring-0 focus:border-orange-500" value={scrapeLimit} onChange={(event) => setScrapeLimit(event.target.value)} placeholder="Limit" type="number" min={1} />
                <select className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none ring-0 focus:border-orange-500" value={scrapeMarketplaceId} onChange={(event) => setScrapeMarketplaceId(event.target.value)}>
                  <option value="">Shopee only / default</option>
                  {(data?.marketplaces ?? [])
                    .filter((marketplace: AnyRecord) => marketplace.slug === 'shopee')
                    .map((marketplace: AnyRecord) => (
                      <option key={marketplace.id} value={marketplace.id}>
                        {marketplace.name}
                      </option>
                    ))}
                </select>
                <Button size="sm" onClick={() => void runScrape()} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                  Run Scraping
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-900">Create records</div>
              <div className="mt-3 grid gap-2">
                <Button variant="outline" size="sm" onClick={() => openCreateModal('product')}>
                  <Package className="mr-2 h-4 w-4" /> Create product
                </Button>
                <Button variant="outline" size="sm" onClick={() => openCreateModal('marketplace')}>
                  <Store className="mr-2 h-4 w-4" /> Create marketplace
                </Button>
                <Button variant="outline" size="sm" onClick={() => openCreateModal('affiliate')}>
                  <Link2 className="mr-2 h-4 w-4" /> Create affiliate link
                </Button>
                <Button variant="outline" size="sm" onClick={() => openCreateModal('article')}>
                  <FileText className="mr-2 h-4 w-4" /> Create article
                </Button>
                <Button variant="outline" size="sm" onClick={() => openCreateModal('price')}>
                  <Database className="mr-2 h-4 w-4" /> Create product price
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white text-slate-900">
          <div className="text-sm font-semibold text-slate-900">Scraping status summary</div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            {(data?.dashboard?.scrapingStatusSummary ?? []).map((item: AnyRecord) => (
              <div key={item.status} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span>{item.status}</span>
                <span className="font-semibold text-slate-900">{item.total}</span>
              </div>
            ))}
            {!data?.dashboard?.scrapingStatusSummary?.length ? <div className="rounded-2xl bg-slate-50 px-4 py-3 text-slate-500">No scraping jobs yet</div> : null}
          </div>
          <div className="mt-6 flex gap-3">
            <Button variant="secondary" size="sm" onClick={() => void refresh()}>
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
            <Link href="/products" className="inline-flex h-9 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50">
              Browse products
            </Link>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden bg-white text-slate-900">
          <div className="border-b border-slate-200 px-6 py-4">
            <div className="text-sm font-semibold text-slate-900">Products</div>
            <div className="mt-1 text-sm text-slate-500">Real data from database</div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-500">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Worth it</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(data?.products?.items ?? []).map((product: AnyRecord) => (
                  <tr key={product.id} className="border-t border-slate-100">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-950">{product.name}</div>
                      <div className="text-xs text-slate-500">{product.slug}</div>
                    </td>
                    <td className="px-6 py-4">{product.status}</td>
                    <td className="px-6 py-4">{Number(product.worthItScore ?? 0).toFixed(0)}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/products/${product.slug}`} className="inline-flex h-8 items-center rounded-full border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                          <Eye className="mr-1 h-3.5 w-3.5" /> Detail
                        </Link>
                        <Button size="sm" variant="outline" onClick={() => void mutateWithConfirm('Set featured?', async () => apiFetch(`/products/${product.id}/featured`, { method: 'PATCH', body: JSON.stringify({ isFeatured: !product.isFeatured }) }))}>
                          <Sparkles className="mr-1 h-3.5 w-3.5" /> Featured
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => void mutateWithConfirm('Toggle trending?', async () => apiFetch(`/products/${product.id}/trending`, { method: 'PATCH', body: JSON.stringify({ isTrending: !product.isTrending }) }))}>
                          <TrendingUp className="mr-1 h-3.5 w-3.5" /> Trending
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => void mutateWithConfirm('Publish this product?', async () => apiFetch(`/products/${product.id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'PUBLISHED' }) }))}>
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Publish
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => void mutateWithConfirm('Delete this product?', async () => apiFetch(`/products/${product.id}`, { method: 'DELETE' }))}>
                          <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="overflow-hidden bg-white text-slate-900">
          <div className="border-b border-slate-200 px-6 py-4">
            <div className="text-sm font-semibold text-slate-900">Marketplaces</div>
            <div className="mt-1 text-sm text-slate-500">Shopee, Tokopedia, Lazada, Blibli, Bukalapak</div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-500">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Active</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(data?.marketplaces ?? []).map((marketplace: AnyRecord) => (
                  <tr key={marketplace.id} className="border-t border-slate-100">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-950">{marketplace.name}</div>
                      <div className="text-xs text-slate-500">{marketplace.slug}</div>
                    </td>
                    <td className="px-6 py-4">{marketplace.isActive ? 'Active' : 'Inactive'}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => void mutateWithConfirm('Toggle marketplace active state?', async () => apiFetch(`/marketplaces/${marketplace.id}/toggle`, { method: 'PATCH', body: JSON.stringify({ isActive: !marketplace.isActive }) }))}>
                          {marketplace.isActive ? <ToggleLeft className="mr-1 h-3.5 w-3.5" /> : <ToggleRight className="mr-1 h-3.5 w-3.5" />} Toggle
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => void mutateWithConfirm('Delete this marketplace?', async () => apiFetch(`/marketplaces/${marketplace.id}`, { method: 'DELETE' }))}>
                          <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="overflow-hidden bg-white text-slate-900">
          <div className="border-b border-slate-200 px-6 py-4">
            <div className="text-sm font-semibold text-slate-900">Affiliate links</div>
            <div className="mt-1 text-sm text-slate-500">Internal redirect flow is active</div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-500">
                <tr>
                  <th className="px-6 py-3">Campaign</th>
                  <th className="px-6 py-3">Clicks</th>
                  <th className="px-6 py-3">Active</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(data?.affiliateLinks ?? []).map((link: AnyRecord) => (
                  <tr key={link.id} className="border-t border-slate-100">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-950">{link.campaignName ?? link.shortCode}</div>
                      <div className="text-xs text-slate-500">{link.shortCode}</div>
                    </td>
                    <td className="px-6 py-4">{link.clicks ?? link.clickCount ?? 0}</td>
                    <td className="px-6 py-4">{link.isActive ? 'Yes' : 'No'}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => void mutateWithConfirm('Toggle affiliate active state?', async () => apiFetch(`/affiliate-links/${link.id}`, { method: 'PATCH', body: JSON.stringify({ isActive: !link.isActive }) }))}>
                          {link.isActive ? <ToggleLeft className="mr-1 h-3.5 w-3.5" /> : <ToggleRight className="mr-1 h-3.5 w-3.5" />} Toggle
                        </Button>
                        <a href={`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api'}/redirect/${link.id}`} className="inline-flex h-8 items-center rounded-full border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                          <Play className="mr-1 h-3.5 w-3.5" /> Test redirect
                        </a>
                        <Button size="sm" variant="ghost" onClick={() => void mutateWithConfirm('Delete this affiliate link?', async () => apiFetch(`/affiliate-links/${link.id}`, { method: 'DELETE' }))}>
                          <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="overflow-hidden bg-white text-slate-900">
          <div className="border-b border-slate-200 px-6 py-4">
            <div className="text-sm font-semibold text-slate-900">Articles</div>
            <div className="mt-1 text-sm text-slate-500">SEO-ready content management</div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-500">
                <tr>
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(data?.articles ?? []).map((article: AnyRecord) => (
                  <tr key={article.id} className="border-t border-slate-100">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-950">{article.title}</div>
                      <div className="text-xs text-slate-500">{article.slug}</div>
                    </td>
                    <td className="px-6 py-4">{article.status}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => void mutateWithConfirm('Publish this article?', async () => apiFetch(`/articles/${article.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'PUBLISHED', publishedAt: new Date().toISOString() }) }))}>
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Publish
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => void mutateWithConfirm('Unpublish this article?', async () => apiFetch(`/articles/${article.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'DRAFT', publishedAt: null }) }))}>
                          <XCircle className="mr-1 h-3.5 w-3.5" /> Draft
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => void mutateWithConfirm('Delete this article?', async () => apiFetch(`/articles/${article.id}`, { method: 'DELETE' }))}>
                          <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden bg-white text-slate-900">
          <div className="border-b border-slate-200 px-6 py-4">
            <div className="text-sm font-semibold text-slate-900">Scraping jobs</div>
            <div className="mt-1 text-sm text-slate-500">Success / failed logs</div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-500">
                <tr>
                  <th className="px-6 py-3">Keyword</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Found</th>
                  <th className="px-6 py-3">Started</th>
                </tr>
              </thead>
              <tbody>
                {(data?.scrapingJobs ?? []).map((job: AnyRecord) => (
                  <tr key={job.id} className="border-t border-slate-100">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-950">{job.keyword}</div>
                      <div className="text-xs text-slate-500">{job.marketplace?.name ?? job.marketplaceId}</div>
                    </td>
                    <td className="px-6 py-4">{job.status}</td>
                    <td className="px-6 py-4">{job.totalFound ?? job._count?.scrapedProducts ?? 0}</td>
                    <td className="px-6 py-4">{formatDate(job.startedAt ?? job.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="overflow-hidden bg-white text-slate-900">
          <div className="border-b border-slate-200 px-6 py-4">
            <div className="text-sm font-semibold text-slate-900">Scraped products</div>
            <div className="mt-1 text-sm text-slate-500">Approve, reject, convert, or merge</div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-500">
                <tr>
                  <th className="px-6 py-3">Item</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(data?.scrapedProducts ?? []).map((item: AnyRecord) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-950">{item.productName}</div>
                      <div className="text-xs text-slate-500">{item.marketplace?.name ?? item.marketplaceId} · {item.keyword}</div>
                    </td>
                    <td className="px-6 py-4">{item.status}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => void mutateWithConfirm('Approve scraped product?', async () => apiFetch(`/scraped-products/${item.id}/approve`, { method: 'PATCH' }))}>
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => void mutateWithConfirm('Reject scraped product?', async () => apiFetch(`/scraped-products/${item.id}/reject`, { method: 'PATCH' }))}>
                          <XCircle className="mr-1 h-3.5 w-3.5" /> Reject
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => void mutateWithConfirm('Convert to main product?', async () => apiFetch(`/scraped-products/${item.id}/convert`, { method: 'POST' }))}>
                          <Pencil className="mr-1 h-3.5 w-3.5" /> Convert
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => {
                          const productId = window.prompt('Merge to product ID');
                          if (!productId) return;
                          void mutateWithConfirm('Merge into existing product?', async () => apiFetch(`/scraped-products/${item.id}/merge`, { method: 'POST', body: JSON.stringify({ productId }) }));
                        }}>
                          <Database className="mr-1 h-3.5 w-3.5" /> Merge
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 bg-white text-slate-900">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-slate-900">Analytics</div>
              <div className="mt-1 text-sm text-slate-500">Real database metrics</div>
            </div>
            <BarChart3 className="h-5 w-5 text-orange-500" />
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span>Total affiliate clicks</span>
              <span className="font-semibold text-slate-900">{analytics.totalAffiliateClicks ?? 0}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span>Success scraping jobs</span>
              <span className="font-semibold text-emerald-600">{analytics.scrapingJobs?.successJobs ?? 0}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span>Failed scraping jobs</span>
              <span className="font-semibold text-rose-600">{analytics.scrapingJobs?.failedJobs ?? 0}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span>Published products</span>
              <span className="font-semibold text-slate-900">{analytics.publishedProducts ?? 0}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white text-slate-900">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-slate-900">Latest affiliate clicks</div>
              <div className="mt-1 text-sm text-slate-500">Recent click logs</div>
            </div>
            <Bell className="h-5 w-5 text-orange-500" />
          </div>
          <div className="mt-4 space-y-3">
            {(data?.dashboard?.recentAffiliateClicks ?? []).map((click: AnyRecord) => (
              <div key={click.id} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <div className="font-semibold text-slate-950">{click.product?.name ?? click.affiliateLink?.campaignName ?? click.affiliateLink?.shortCode}</div>
                <div className="mt-1">{click.marketplace?.name ?? click.marketplaceId} · {formatDate(click.clickedAt)}</div>
              </div>
            ))}
            {!data?.dashboard?.recentAffiliateClicks?.length ? <div className="rounded-2xl bg-slate-50 px-4 py-3 text-slate-500">No clicks yet</div> : null}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 bg-white text-slate-900">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-slate-900">Top clicked products</div>
              <div className="mt-1 text-sm text-slate-500">Real click ranking</div>
            </div>
            <LayoutGrid className="h-5 w-5 text-orange-500" />
          </div>
          <div className="mt-4 space-y-3">
            {(data?.dashboard?.topClickedProducts ?? []).map((item: AnyRecord) => (
              <div key={item.productId} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <div className="font-semibold text-slate-950">{item.product?.name ?? item.productId}</div>
                <div className="mt-1">{item.count} clicks</div>
              </div>
            ))}
            {!data?.dashboard?.topClickedProducts?.length ? <div className="rounded-2xl bg-slate-50 px-4 py-3 text-slate-500">No rankings yet</div> : null}
          </div>
        </Card>

        <Card className="p-6 bg-white text-slate-900">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-slate-900">Latest scraped products</div>
              <div className="mt-1 text-sm text-slate-500">Newest raw results from scraper</div>
            </div>
            <Search className="h-5 w-5 text-orange-500" />
          </div>
          <div className="mt-4 space-y-3">
            {(data?.dashboard?.latestScrapedProducts ?? []).map((item: AnyRecord) => (
              <div key={item.id} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <div className="font-semibold text-slate-950">{item.productName}</div>
                <div className="mt-1">{item.marketplace?.name ?? item.marketplaceId} · {formatCurrency(item.price)} · {item.status}</div>
              </div>
            ))}
            {!data?.dashboard?.latestScrapedProducts?.length ? <div className="rounded-2xl bg-slate-50 px-4 py-3 text-slate-500">No scraped items yet</div> : null}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 bg-white text-slate-900 lg:col-span-2">
          <div className="text-sm font-semibold text-slate-900">Control center notes</div>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">Backend CRUD, manual scrape, review flow, redirect tracking, and analytics are now wired to live endpoints.</div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">Use the quick actions to seed products, marketplaces, affiliate links, articles, and price rows.</div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">Scraped product approval can now convert raw rows into main products or merge into existing products.</div>
          </div>
        </Card>

        <Card className="p-6 bg-white text-slate-900">
          <div className="text-sm font-semibold text-slate-900">System status</div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span>Access level</span>
              <span className="font-semibold text-emerald-600">ADMIN</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span>Scraper health</span>
              <span className="font-semibold text-emerald-600">Ready</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span>Database</span>
              <span className="font-semibold text-emerald-600">PostgreSQL</span>
            </div>
          </div>
        </Card>
      </section>

      {createModalType ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 px-4">
          <Card className="w-full max-w-xl bg-white p-6 text-slate-900 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold tracking-tight text-slate-950">{createFormConfig[createModalType].title}</h3>
                <p className="mt-1 text-sm text-slate-500">{createFormConfig[createModalType].description}</p>
              </div>
              <button
                type="button"
                onClick={closeCreateModal}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                disabled={isCreateSubmitting}
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid gap-3">
              {createFormConfig[createModalType].fields.map((field) => (
                <label key={field.key} className="grid gap-1.5 text-sm">
                  <span className="font-medium text-slate-700">{field.label}</span>
                  {field.multiline ? (
                    <textarea
                      className="min-h-28 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-0 focus:border-orange-500"
                      placeholder={field.placeholder}
                      value={createForm[field.key] ?? ''}
                      onChange={(event) => onCreateFieldChange(field.key, event.target.value)}
                    />
                  ) : (
                    <input
                      className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none ring-0 focus:border-orange-500"
                      placeholder={field.placeholder}
                      type={field.type ?? 'text'}
                      value={createForm[field.key] ?? ''}
                      onChange={(event) => onCreateFieldChange(field.key, event.target.value)}
                    />
                  )}
                </label>
              ))}
            </div>

            {createError ? (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{createError}</div>
            ) : null}

            <div className="mt-5 flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={closeCreateModal} disabled={isCreateSubmitting}>
                Cancel
              </Button>
              <Button size="sm" onClick={() => void submitCreateForm()} disabled={isCreateSubmitting}>
                {isCreateSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </main>
  );
}
