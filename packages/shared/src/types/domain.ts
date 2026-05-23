export type MarketplaceSlug = 'shopee' | 'tokopedia' | 'tiktok_shop' | 'lazada' | 'blibli' | 'bukalapak';

export interface MarketplaceMeta {
  slug: MarketplaceSlug;
  name: string;
  color: string;
  active: boolean;
  affiliateEnabled: boolean;
  sortOrder: number;
}

export interface ProductPriceSnapshot {
  marketplaceSlug: MarketplaceSlug;
  price: number;
  originalPrice?: number | null;
  cashbackValue?: number | null;
  discountPercent?: number | null;
  updatedAt: string;
}

export interface WorthItScoreInput {
  price: number;
  marketMedianPrice: number;
  rating: number;
  reviewCount: number;
  sellerReputation: number;
  discountPercent: number;
  cashbackValue: number;
  popularityScore: number;
  priceHistoryScore: number;
  specScore: number;
  manualOverrideScore?: number;
}

export interface WorthItScoreBreakdown {
  score: number;
  normalized: Record<string, number>;
  weights: Record<string, number>;
}
