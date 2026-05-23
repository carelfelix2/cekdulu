import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

type WorthItScoreInput = {
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

const calculateWorthItScore = (input: WorthItScoreInput) => {
  const weights = {
    price: 0.22,
    rating: 0.16,
    reviews: 0.12,
    sellerReputation: 0.1,
    discount: 0.08,
    cashback: 0.06,
    popularity: 0.08,
    priceHistory: 0.08,
    spec: 0.05,
    manualOverride: 0.05
  };

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
    manualOverride: clamp(input.manualOverrideScore ?? 50)
  };

  const score = Object.entries(weights).reduce((acc, [key, weight]) => {
    const normalizedKey = key as keyof typeof normalized;
    return acc + normalized[normalizedKey] * weight;
  }, 0);

  return {
    score: Math.round(clamp(score)),
    normalized,
    weights
  };
};

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService) {}

  private get prisma() {
    return this.prismaService.client;
  }

  async list(page = 1, limit = 20): Promise<{ items: any[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
    const skip = (Math.max(page, 1) - 1) * Math.max(limit, 1);
    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        skip,
        take: limit,
        orderBy: [{ popularityScore: 'desc' }, { updatedAt: 'desc' }],
        include: { brand: true, category: true, listings: { take: 3, orderBy: { price: 'asc' }, include: { marketplace: true } } }
      }),
      this.prisma.product.count()
    ]);

    return {
      items,
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) }
    };
  }

  async trending(): Promise<any[]> {
    return this.prisma.product.findMany({
      take: 10,
      orderBy: [{ popularityScore: 'desc' }, { updatedAt: 'desc' }],
      include: { brand: true, category: true }
    });
  }

  async autocomplete(query: string): Promise<any[]> {
    if (!query.trim()) return [];
    return this.prisma.product.findMany({
      take: 6,
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { slug: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: { id: true, name: true, slug: true, imageUrl: true }
    });
  }

  async detail(slug: string): Promise<any> {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        brand: true,
        category: true,
        images: true,
        variants: true,
        listings: { include: { marketplace: true, seller: true }, orderBy: { price: 'asc' } },
        faqItems: true
      }
    });

    if (!product) throw new NotFoundException('Product not found');

    return {
      ...product,
      worthItScore: calculateWorthItScore({
        price: Number(product.listings[0]?.price ?? 0),
        marketMedianPrice: Number(product.listings[Math.floor(product.listings.length / 2)]?.price ?? product.listings[0]?.price ?? 1),
        rating: Number(product.listings[0]?.rating ?? 0),
        reviewCount: (product.listings as Array<{ reviewCount: number }>).reduce((sum: number, listing: { reviewCount: number }) => sum + listing.reviewCount, 0),
        sellerReputation: Number(product.listings[0]?.seller?.rating ?? 70),
        discountPercent: Number(product.listings[0]?.discountPercent ?? 0),
        cashbackValue: Number(product.listings[0]?.cashbackValue ?? 0),
        popularityScore: product.popularityScore,
        priceHistoryScore: 80,
        specScore: 85,
        manualOverrideScore: product.manualWorthItScore
      })
    };
  }

  async compare(slug: string): Promise<any> {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: { listings: { include: { marketplace: true, seller: true }, orderBy: { price: 'asc' } } }
    });

    if (!product) throw new NotFoundException('Product not found');

    const cheapest = product.listings[0]?.price ?? 0;
    return {
      product,
      cheapest,
      listings: (product.listings as Array<{ price: unknown }>).map((listing: { price: unknown }) => ({
        ...listing,
        isCheapest: Number(listing.price) === Number(cheapest)
      }))
    };
  }

  async priceHistory(slug: string): Promise<any> {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      select: { id: true, slug: true, name: true }
    });

    if (!product) throw new NotFoundException('Product not found');

    const points = await this.prisma.pricePoint.findMany({
      where: { productId: product.id },
      orderBy: { capturedAt: 'asc' },
      take: 120
    });

    return { product, points };
  }
}
