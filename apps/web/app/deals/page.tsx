import type { Metadata } from 'next';
import { flashDeals } from '@/lib/mock-data';
import { SectionHeading } from '@/components/section-heading';
import { DealCard } from '@/components/deal-card';

export const metadata: Metadata = {
  title: 'Deals',
  description: 'Aggregasi flash deal dan promo terbaik dari marketplace Indonesia.'
};

export default function DealsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Deal aggregation"
        title="Promo terbaik hari ini"
        description="Halaman ini menggabungkan diskon, cashback, dan countdown deal dari marketplace aktif."
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {flashDeals.map((deal) => (
          <DealCard key={deal.title} deal={deal} />
        ))}
      </div>
    </main>
  );
}
