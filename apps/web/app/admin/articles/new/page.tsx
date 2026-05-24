'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CalendarClock, FileText, Loader2, Save, Send, Settings2, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

type ArticleStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';

type ArticleForm = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: ArticleStatus;
  coverImageUrl: string;
  coverImageAlt: string;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  publishAt: string;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const estimateReadingTime = (text: string) => {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};

const defaultForm: ArticleForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  status: 'DRAFT',
  coverImageUrl: '',
  coverImageAlt: '',
  seoTitle: '',
  seoDescription: '',
  canonicalUrl: '',
  publishAt: ''
};

export default function NewAdminArticlePage() {
  const router = useRouter();
  const contentRef = useRef<HTMLTextAreaElement | null>(null);
  const { user, isLoading, isAuthenticated } = useAuth();
  const [form, setForm] = useState<ArticleForm>(defaultForm);
  const [slugEdited, setSlugEdited] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = useMemo(() => {
    const roles = user?.roles ?? [];
    return roles.includes('ADMIN') || roles.includes('SUPER_ADMIN');
  }, [user?.roles]);

  useEffect(() => {
    if (!slugEdited && form.title) {
      setForm((prev) => ({ ...prev, slug: slugify(form.title) }));
    }
  }, [form.title, slugEdited]);

  const contentWords = useMemo(() => form.content.trim().split(/\s+/).filter(Boolean).length, [form.content]);
  const readingTime = useMemo(() => estimateReadingTime(form.content), [form.content]);

  const setField = <K extends keyof ArticleForm>(key: K, value: ArticleForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const insertAtCursor = (prefix: string, suffix = '') => {
    const element = contentRef.current;
    if (!element) return;
    const start = element.selectionStart;
    const end = element.selectionEnd;
    const selected = form.content.slice(start, end);
    const replaced = `${prefix}${selected}${suffix}`;
    const nextContent = `${form.content.slice(0, start)}${replaced}${form.content.slice(end)}`;
    setField('content', nextContent);

    requestAnimationFrame(() => {
      element.focus();
      const cursor = start + replaced.length;
      element.setSelectionRange(cursor, cursor);
    });
  };

  const buildPayload = (status: ArticleStatus) => {
    const publishAt = status === 'SCHEDULED' && form.publishAt ? new Date(form.publishAt).toISOString() : status === 'PUBLISHED' ? new Date().toISOString() : null;

    return {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt || form.title,
      content: form.content,
      status,
      coverImageUrl: form.coverImageUrl || undefined,
      coverImageAlt: form.coverImageAlt || undefined,
      seoTitle: form.seoTitle || undefined,
      seoDescription: form.seoDescription || undefined,
      canonicalUrl: form.canonicalUrl || undefined,
      metaDescription: form.seoDescription || undefined,
      publishedAt: publishAt,
      readingTimeMinutes: readingTime
    };
  };

  const validate = () => {
    if (!form.title.trim()) return 'Judul artikel wajib diisi.';
    if (!form.slug.trim()) return 'Slug wajib diisi.';
    if (!form.content.trim()) return 'Konten artikel masih kosong.';
    if (form.status === 'SCHEDULED' && !form.publishAt) return 'Untuk status scheduled, pilih tanggal publish.';
    return null;
  };

  const saveArticle = async (mode: 'draft' | 'publish') => {
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const targetStatus: ArticleStatus = mode === 'draft' ? 'DRAFT' : form.status === 'DRAFT' ? 'PUBLISHED' : form.status;
    const payload = buildPayload(targetStatus);

    try {
      if (mode === 'draft') setIsSavingDraft(true);
      if (mode === 'publish') setIsSubmitting(true);

      await apiFetch('/articles', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      router.push('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan artikel.');
    } finally {
      setIsSavingDraft(false);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="py-20 text-center text-white/70">Memuat editor artikel...</div>;
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <Card className="p-8 text-center text-slate-900">
          <h1 className="text-2xl font-black tracking-tight">Akses ditolak</h1>
          <p className="mt-3 text-slate-600">Halaman ini khusus admin.</p>
          <div className="mt-5">
            <Link href="/admin" className="inline-flex h-10 items-center justify-center rounded-full bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800">
              Kembali ke Admin
            </Link>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-orange-600 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge className="bg-white/10 text-white">WordPress-style Editor</Badge>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-white">Create New Article</h1>
            <p className="mt-2 text-sm text-white/75">Editor penuh dengan panel publish, SEO, dan preview ringkas.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin" className="inline-flex h-10 items-center justify-center rounded-full border border-white/20 px-4 text-sm font-semibold text-white hover:bg-white/10">
              <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
            </Link>
            <Button variant="outline" size="sm" className="border-white/20 bg-white text-slate-900 hover:bg-white/90" onClick={() => void saveArticle('draft')} disabled={isSavingDraft || isSubmitting}>
              {isSavingDraft ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Draft
            </Button>
            <Button size="sm" className="bg-orange-500 text-white hover:bg-orange-600" onClick={() => void saveArticle('publish')} disabled={isSavingDraft || isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Publish
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.45fr_0.75fr]">
        <Card className="bg-white p-6 text-slate-900">
          <div className="space-y-5">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Title</label>
              <input
                className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-lg font-semibold outline-none focus:border-orange-500"
                placeholder="Tulis judul artikel..."
                value={form.title}
                onChange={(event) => setField('title', event.target.value)}
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Slug</label>
                <input
                  className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-orange-500"
                  placeholder="slug-artikel"
                  value={form.slug}
                  onChange={(event) => {
                    setSlugEdited(true);
                    setField('slug', slugify(event.target.value));
                  }}
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Excerpt</label>
                <input
                  className="mt-2 h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-orange-500"
                  placeholder="Ringkasan artikel singkat"
                  value={form.excerpt}
                  onChange={(event) => setField('excerpt', event.target.value)}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200">
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2">
                <Button variant="outline" size="sm" onClick={() => insertAtCursor('**', '**')}>Bold</Button>
                <Button variant="outline" size="sm" onClick={() => insertAtCursor('*', '*')}>Italic</Button>
                <Button variant="outline" size="sm" onClick={() => insertAtCursor('## ')}>H2</Button>
                <Button variant="outline" size="sm" onClick={() => insertAtCursor('- ')}>List</Button>
                <Button variant="outline" size="sm" onClick={() => insertAtCursor('[Link text](', ')')}>Link</Button>
                <div className="ml-auto text-xs text-slate-500">{contentWords} words</div>
              </div>
              <textarea
                ref={contentRef}
                className="min-h-[420px] w-full rounded-b-2xl border-0 px-4 py-4 text-sm outline-none focus:ring-0"
                placeholder="Mulai menulis konten artikel di sini..."
                value={form.content}
                onChange={(event) => setField('content', event.target.value)}
              />
            </div>

            {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="bg-white p-5 text-slate-900">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Settings2 className="h-4 w-4 text-orange-500" /> Publish Settings
            </div>
            <div className="mt-4 grid gap-3">
              <label className="grid gap-1.5 text-sm">
                <span className="text-slate-600">Status</span>
                <select
                  className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-orange-500"
                  value={form.status}
                  onChange={(event) => setField('status', event.target.value as ArticleStatus)}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </label>

              <label className="grid gap-1.5 text-sm">
                <span className="flex items-center text-slate-600"><CalendarClock className="mr-1.5 h-4 w-4" /> Publish at</span>
                <input
                  type="datetime-local"
                  className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-orange-500"
                  value={form.publishAt}
                  onChange={(event) => setField('publishAt', event.target.value)}
                />
              </label>
            </div>
          </Card>

          <Card className="bg-white p-5 text-slate-900">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Sparkles className="h-4 w-4 text-orange-500" /> SEO
            </div>
            <div className="mt-4 grid gap-3">
              <input
                className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-orange-500"
                placeholder="SEO title"
                value={form.seoTitle}
                onChange={(event) => setField('seoTitle', event.target.value)}
              />
              <textarea
                className="min-h-24 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-500"
                placeholder="SEO description"
                value={form.seoDescription}
                onChange={(event) => setField('seoDescription', event.target.value)}
              />
              <input
                className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-orange-500"
                placeholder="Canonical URL"
                value={form.canonicalUrl}
                onChange={(event) => setField('canonicalUrl', event.target.value)}
              />
            </div>
          </Card>

          <Card className="bg-white p-5 text-slate-900">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <FileText className="h-4 w-4 text-orange-500" /> Media
            </div>
            <div className="mt-4 grid gap-3">
              <input
                className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-orange-500"
                placeholder="Cover image URL"
                value={form.coverImageUrl}
                onChange={(event) => setField('coverImageUrl', event.target.value)}
              />
              <input
                className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-orange-500"
                placeholder="Cover image alt text"
                value={form.coverImageAlt}
                onChange={(event) => setField('coverImageAlt', event.target.value)}
              />
            </div>
          </Card>

          <Card className="bg-white p-5 text-slate-900">
            <div className="text-sm font-semibold text-slate-900">Live Summary</div>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"><span>Status</span><span className="font-semibold text-slate-900">{form.status}</span></div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"><span>Words</span><span className="font-semibold text-slate-900">{contentWords}</span></div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"><span>Reading Time</span><span className="font-semibold text-slate-900">{readingTime} min</span></div>
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <div className="text-xs text-slate-500">Permalink</div>
                <div className="mt-1 truncate font-medium text-slate-900">/articles/{form.slug || 'your-slug'}</div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
