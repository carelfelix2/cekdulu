import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Star, TrendingDown } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { formatIDR } from '@/lib/utils';
import { calculateWorthItScore } from '@cekdulu/shared';
import type { UiProduct } from '@/lib/mock-data';

export function ProductCard({ product }: { product: UiProduct }) {
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

  return (
    <Card className="group overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <Image src={product.imageUrl} alt={product.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute left-4 top-4 flex gap-2">
            <Badge className="bg-white/90 text-slate-800 shadow-sm">{product.category}</Badge>
            {product.trendingDelta < 0 ? (
              <Badge className="bg-emerald-50 text-emerald-700">
                <TrendingDown className="mr-1 h-3.5 w-3.5" /> {Math.abs(product.trendingDelta)}%
              </Badge>
            ) : null}
          </div>
        </div>
        <div className="space-y-4 p-5">
          <div>
            <div className="line-clamp-2 text-base font-semibold leading-6 text-slate-900">{product.name}</div>
            <div className="mt-1 text-sm text-slate-500">{product.brand}</div>
          </div>

          <div>
            <div className="text-2xl font-black tracking-tight text-orange-500">{formatIDR(product.price)}</div>
            <div className="mt-1 text-xs text-slate-400 line-through">{formatIDR(product.originalPrice)}</div>
          </div>

          <div className="flex items-center justify-between text-sm text-slate-600">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {product.rating}
            </div>
            <div>{product.soldCount} terjual</div>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-orange-500" style={{ width: `${score.score}%` }} />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-500">Worth It Score</span>
            <span className="font-bold text-emerald-600">{score.score}/100</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {product.marketplaces.map((marketplace) => (
              <span key={marketplace.marketplace.slug} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                {marketplace.marketplace.name}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1 text-sm font-semibold text-orange-500">
            <span>Lihat detail</span>
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>
      </Link>
    </Card>
  );
}
