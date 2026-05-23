import { calculateWorthItScore } from '@cekdulu/shared';
import { formatIDR } from '@/lib/utils';
import { Card } from './ui/card';
import type { UiProduct } from '@/lib/mock-data';

export function WorthItCard({ product }: { product: UiProduct }) {
  const score = calculateWorthItScore({
    price: product.price,
    marketMedianPrice: product.marketMedianPrice,
    rating: product.rating,
    reviewCount: product.reviewCount,
    sellerReputation: product.sellerReputation,
    discountPercent: product.discountPercent,
    cashbackValue: product.cashbackValue,
    popularityScore: product.popularityScore,
    priceHistoryScore: product.priceHistoryScore,
    specScore: product.specScore,
    manualOverrideScore: product.manualOverrideScore
  });

  const breakdown = [
    ['Harga', score.normalized.price],
    ['Rating', score.normalized.rating],
    ['Review', score.normalized.reviews],
    ['Seller', score.normalized.sellerReputation],
    ['Diskon', score.normalized.discount],
    ['Cashback', score.normalized.cashback]
  ] as const;

  return (
    <Card className="p-6 sm:p-8">
      <div className="flex items-end gap-4">
        <div className="font-[var(--font-serif)] text-6xl leading-none text-emerald-600">{score.score}</div>
        <div className="pb-2">
          <div className="text-lg font-bold text-slate-900">Worth It Score</div>
          <div className="text-sm text-slate-500">Beli terbaik berdasarkan {formatIDR(product.price)} dan histori pasar</div>
        </div>
      </div>
      <div className="mt-6 space-y-4">
        {breakdown.map(([label, value]) => (
          <div key={label}>
            <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-600">
              <span>{label}</span>
              <span>{Math.round(value)} / 100</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-orange-500" style={{ width: `${value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
