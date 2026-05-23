import type { MarketplaceMeta } from '../types/domain';

export const MARKETPLACES: MarketplaceMeta[] = [
  { slug: 'shopee', name: 'Shopee', color: '#EE4D2D', active: true, affiliateEnabled: true, sortOrder: 1 },
  { slug: 'tokopedia', name: 'Tokopedia', color: '#00AA5B', active: true, affiliateEnabled: true, sortOrder: 2 },
  { slug: 'tiktok_shop', name: 'TikTok Shop', color: '#111111', active: true, affiliateEnabled: true, sortOrder: 3 },
  { slug: 'lazada', name: 'Lazada', color: '#0F146D', active: true, affiliateEnabled: false, sortOrder: 4 },
  { slug: 'blibli', name: 'Blibli', color: '#005FCC', active: true, affiliateEnabled: false, sortOrder: 5 },
  { slug: 'bukalapak', name: 'Bukalapak', color: '#D71149', active: true, affiliateEnabled: false, sortOrder: 6 },
];

export const MVP_MARKETPLACES = MARKETPLACES.filter((marketplace) =>
  ['shopee', 'tokopedia', 'tiktok_shop'].includes(marketplace.slug),
);

export function getMarketplaceMeta(slug: MarketplaceMeta['slug']) {
  return MARKETPLACES.find((marketplace) => marketplace.slug === slug);
}
