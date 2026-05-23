import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class RedirectsService {
  constructor(private readonly prismaService: PrismaService) {}

  private get prisma() {
    return this.prismaService.client;
  }

  async trackAndResolve(shortCode: string, source: string) {
    const link = await this.prisma.affiliateLink.findUnique({ where: { shortCode }, include: { listing: true, product: true, marketplace: true } });
    if (!link) throw new NotFoundException('Affiliate link not found');

    const normalizedSource = source.toUpperCase();

    await this.prisma.redirectClick.create({
      data: {
        affiliateLinkId: link.id,
        productId: link.productId,
        listingId: link.listingId ?? undefined,
        marketplaceId: link.marketplaceId,
        source: normalizedSource as never,
        visitorHash: null
      }
    });

    await this.prisma.affiliateLink.update({ where: { id: link.id }, data: { clicks: { increment: 1 } } });
    return { url: link.url, link };
  }
}
