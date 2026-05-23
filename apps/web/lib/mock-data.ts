import { calculateWorthItScore, type MarketplaceMeta } from '@cekdulu/shared';

export interface UiProduct {
  id: string;
  slug: string;
  name: string;
  category: string;
  brand: string;
  imageUrl: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  soldCount: string;
  popularityScore: number;
  marketMedianPrice: number;
  cashbackValue: number;
  discountPercent: number;
  sellerReputation: number;
  priceHistoryScore: number;
  specScore: number;
  manualOverrideScore: number;
  trendingDelta: number;
  marketplaces: Array<{ marketplace: MarketplaceMeta; price: number; stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' }>;
}

export const featuredProducts: UiProduct[] = [
  {
    id: 'p-1',
    slug: 'iphone-15-128gb',
    name: 'iPhone 15 128GB',
    category: 'Smartphone',
    brand: 'Apple',
    imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3c5e7d1f?auto=format&fit=crop&w=1200&q=80',
    price: 14848000,
    originalPrice: 16999000,
    rating: 4.9,
    reviewCount: 12400,
    soldCount: '12.4rb',
    popularityScore: 96,
    marketMedianPrice: 15200000,
    cashbackValue: 150000,
    discountPercent: 12,
    sellerReputation: 91,
    priceHistoryScore: 86,
    specScore: 93,
    manualOverrideScore: 84,
    trendingDelta: -3.2,
    marketplaces: [
      { marketplace: { slug: 'shopee', name: 'Shopee', color: '#EE4D2D', active: true, affiliateEnabled: true, sortOrder: 1 }, price: 14848000, stockStatus: 'IN_STOCK' },
      { marketplace: { slug: 'tokopedia', name: 'Tokopedia', color: '#00AA5B', active: true, affiliateEnabled: true, sortOrder: 2 }, price: 15200000, stockStatus: 'IN_STOCK' },
      { marketplace: { slug: 'tiktok_shop', name: 'TikTok Shop', color: '#111111', active: true, affiliateEnabled: true, sortOrder: 3 }, price: 14999000, stockStatus: 'IN_STOCK' }
    ]
  },
  {
    id: 'p-2',
    slug: 'samsung-galaxy-a55-5g',
    name: 'Samsung Galaxy A55 5G',
    category: 'Smartphone',
    brand: 'Samsung',
    imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bb3?auto=format&fit=crop&w=1200&q=80',
    price: 4999000,
    originalPrice: 5999000,
    rating: 4.8,
    reviewCount: 8200,
    soldCount: '8.2rb',
    popularityScore: 88,
    marketMedianPrice: 5299000,
    cashbackValue: 100000,
    discountPercent: 18,
    sellerReputation: 89,
    priceHistoryScore: 92,
    specScore: 86,
    manualOverrideScore: 91,
    trendingDelta: -2.6,
    marketplaces: [
      { marketplace: { slug: 'shopee', name: 'Shopee', color: '#EE4D2D', active: true, affiliateEnabled: true, sortOrder: 1 }, price: 4999000, stockStatus: 'IN_STOCK' },
      { marketplace: { slug: 'tokopedia', name: 'Tokopedia', color: '#00AA5B', active: true, affiliateEnabled: true, sortOrder: 2 }, price: 5079000, stockStatus: 'LOW_STOCK' }
    ]
  },
  {
    id: 'p-3',
    slug: 'asus-zenbook-14-oled',
    name: 'ASUS Zenbook 14 OLED',
    category: 'Laptop',
    brand: 'ASUS',
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    price: 13999000,
    originalPrice: 16999000,
    rating: 4.8,
    reviewCount: 3700,
    soldCount: '3.7rb',
    popularityScore: 81,
    marketMedianPrice: 14700000,
    cashbackValue: 250000,
    discountPercent: 18,
    sellerReputation: 87,
    priceHistoryScore: 84,
    specScore: 90,
    manualOverrideScore: 88,
    trendingDelta: -5.1,
    marketplaces: [
      { marketplace: { slug: 'shopee', name: 'Shopee', color: '#EE4D2D', active: true, affiliateEnabled: true, sortOrder: 1 }, price: 13999000, stockStatus: 'IN_STOCK' },
      { marketplace: { slug: 'tokopedia', name: 'Tokopedia', color: '#00AA5B', active: true, affiliateEnabled: true, sortOrder: 2 }, price: 14150000, stockStatus: 'IN_STOCK' },
      { marketplace: { slug: 'tiktok_shop', name: 'TikTok Shop', color: '#111111', active: true, affiliateEnabled: true, sortOrder: 3 }, price: 14200000, stockStatus: 'LOW_STOCK' }
    ]
  }
];

export const trendingArticles = [
  {
    slug: 'iphone-vs-samsung-worth-it',
    title: 'iPhone vs Samsung: Mana yang Lebih Worth It di 2026?',
    category: 'Review',
    publishedAt: '2026-05-12',
    readTime: '8 menit'
  },
  {
    slug: 'cara-hemat-belanja-online',
    title: '10 Cara Hemat Belanja Online yang Jarang Diketahui',
    category: 'Tips Hemat',
    publishedAt: '2026-05-11',
    readTime: '5 menit'
  }
];

export const flashDeals = [
  {
    title: 'MacBook Air M2 8GB',
    marketplace: 'Tokopedia',
    discount: 25,
    saving: 3500000,
    endsIn: '05:42:17'
  },
  {
    title: 'Sony WH-1000XM5',
    marketplace: 'Shopee',
    discount: 31,
    saving: 1800000,
    endsIn: '01:08:55'
  }
];

export const worthItPreview = calculateWorthItScore({
  price: featuredProducts[0].price,
  marketMedianPrice: featuredProducts[0].marketMedianPrice,
  rating: featuredProducts[0].rating,
  reviewCount: featuredProducts[0].reviewCount,
  sellerReputation: featuredProducts[0].sellerReputation,
  discountPercent: featuredProducts[0].discountPercent,
  cashbackValue: featuredProducts[0].cashbackValue,
  popularityScore: featuredProducts[0].popularityScore,
  priceHistoryScore: featuredProducts[0].priceHistoryScore,
  specScore: featuredProducts[0].specScore,
  manualOverrideScore: featuredProducts[0].manualOverrideScore
});
