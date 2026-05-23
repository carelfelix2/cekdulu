import { Injectable, NotFoundException } from '@nestjs/common';
import { calculateWorthItScore } from '@cekdulu/shared';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService) {}

  private get prisma() {
    return this.prismaService.client;
  }

  async list(page = 1, limit = 20) {
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

  async trending() {
    return this.prisma.product.findMany({
      take: 10,
      orderBy: [{ popularityScore: 'desc' }, { updatedAt: 'desc' }],
      include: { brand: true, category: true }
    });
  }

  async autocomplete(query: string) {
    if (!query.trim()) return [];
    return this.prisma.product.findMany({
      take: 6,
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { slug: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: { id: true, name: true, slug: true, imageUrl: true, price: true }
    });
  }

  async detail(slug: string) {
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
        reviewCount: product.listings.reduce((sum, listing) => sum + listing.reviewCount, 0),
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

  async compare(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: { listings: { include: { marketplace: true, seller: true }, orderBy: { price: 'asc' } } }
    });

    if (!product) throw new NotFoundException('Product not found');

    const cheapest = product.listings[0]?.price ?? 0;
    return {
      product,
      cheapest,
      listings: product.listings.map((listing) => ({
        ...listing,
        isCheapest: Number(listing.price) === Number(cheapest)
      }))
    };
  }

  async priceHistory(slug: string) {
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
