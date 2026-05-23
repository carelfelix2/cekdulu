'use client';

import { motion } from 'framer-motion';
import { Badge } from './ui/badge';
import { SearchBar } from './search-bar';

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-white/85">
      <div className="absolute inset-0 bg-grid opacity-[0.22] [background-size:24px_24px]" />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="inline-flex">
            <Badge className="bg-orange-50 text-orange-700">Live price tracking aktif</Badge>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-6 font-[var(--font-jakarta)] text-4xl font-black tracking-tight text-slate-950 sm:text-6xl"
          >
            Cek harga terbaik sebelum beli.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg"
          >
            Bandingkan Shopee, Tokopedia, TikTok Shop, Lazada, Blibli, dan Bukalapak dalam satu platform.
            Temukan produk paling worth it, pantau histori harga, dan arahkan ke link affiliate terbaik.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-8">
            <SearchBar />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4"
          >
            {[
              ['2.4M+', 'Produk aktif'],
              ['5+', 'Marketplace'],
              ['98.2%', 'Akurasi harga'],
              ['2m', 'Update cepat']
            ].map(([value, label]) => (
              <div key={label} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-soft">
                <div className="text-2xl font-black tracking-tight text-slate-950">{value}</div>
                <div className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
