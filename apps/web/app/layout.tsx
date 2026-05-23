import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Inter, Plus_Jakarta_Sans, DM_Serif_Display } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' });
const serif = DM_Serif_Display({ subsets: ['latin'], weight: '400', variable: '--font-serif' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: {
    default: 'CekDulu - Price Comparison & Affiliate Shopping Indonesia',
    template: '%s | CekDulu'
  },
  description:
    'Bandingkan harga marketplace Indonesia, temukan produk paling worth it, dan pantau harga terbaik dengan CekDulu.',
  openGraph: {
    title: 'CekDulu',
    description: 'Price comparison, affiliate tracking, dan rekomendasi produk untuk marketplace Indonesia.',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image'
  }
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id" className={`${inter.variable} ${jakarta.variable} ${serif.variable}`}>
      <body className="font-[var(--font-inter)] antialiased">
        <Providers>
          <SiteHeader />
          {children}
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
