import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <div className="text-sm font-bold uppercase tracking-[0.25em] text-orange-500">404</div>
      <h1 className="mt-4 font-[var(--font-jakarta)] text-4xl font-black tracking-tight text-slate-950">Halaman tidak ditemukan</h1>
      <p className="mt-3 text-slate-600">Link mungkin sudah berubah atau produk belum tersedia.</p>
      <Link href="/" className="mt-8 rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white">Kembali ke beranda</Link>
    </main>
  );
}
