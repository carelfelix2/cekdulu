import type { WorthItScoreBreakdown, WorthItScoreInput } from '../types/domain';

export interface WorthItWeights {
  price: number;
  rating: number;
  reviews: number;
  sellerReputation: number;
  discount: number;
  cashback: number;
  popularity: number;
  priceHistory: number;
  spec: number;
  manualOverride: number;
}

export const DEFAULT_WORTH_IT_WEIGHTS: WorthItWeights = {
  price: 0.22,
  rating: 0.16,
  reviews: 0.12,
  sellerReputation: 0.1,
  discount: 0.08,
  cashback: 0.06,
  popularity: 0.08,
  priceHistory: 0.08,
  spec: 0.05,
  manualOverride: 0.05,
};

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));

const normalizePriceScore = (price: number, marketMedianPrice: number) => {
  if (!marketMedianPrice || marketMedianPrice <= 0) return 50;
  const ratio = price / marketMedianPrice;
  if (ratio <= 0.6) return 100;
  if (ratio >= 1.4) return 0;
  return clamp(100 - ((ratio - 0.6) / 0.8) * 100);
};

const normalizeLogScore = (value: number, maxReference: number) => {
  if (value <= 0) return 0;
  const normalized = Math.log10(value + 1) / Math.log10(maxReference + 1);
  return clamp(normalized * 100);
};

export function calculateWorthItScore(
  input: WorthItScoreInput,
  weights: WorthItWeights = DEFAULT_WORTH_IT_WEIGHTS,
): WorthItScoreBreakdown {
  const normalized = {
    price: normalizePriceScore(input.price, input.marketMedianPrice),
    rating: clamp((input.rating / 5) * 100),
    reviews: normalizeLogScore(input.reviewCount, 50000),
    sellerReputation: clamp(input.sellerReputation),
    discount: clamp(input.discountPercent),
    cashback: clamp((input.cashbackValue / Math.max(input.price, 1)) * 1000),
    popularity: clamp(input.popularityScore),
    priceHistory: clamp(input.priceHistoryScore),
    spec: clamp(input.specScore),
    manualOverride: clamp(input.manualOverrideScore ?? 50),
  };

  const score = Object.entries(weights).reduce((acc, [key, weight]) => {
    const normalizedKey = key as keyof typeof normalized;
    return acc + normalized[normalizedKey] * weight;
  }, 0);

  return {
    score: Math.round(clamp(score)),
    normalized,
    weights: { ...weights },
  };
}
