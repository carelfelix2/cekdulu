import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class RedirectsService {
  constructor(private readonly prismaService: PrismaService) {}

  private get prisma() {
    return this.prismaService.client;
  }

  private async track(link: { id: string; productId: string; listingId: string | null; marketplaceId: string; url: string; affiliateUrl?: string | null }, source: string) {
    const normalizedSource = source.toUpperCase();

    await this.prisma.affiliateClick.create({
      data: {
        affiliateLinkId: link.id,
        productId: link.productId,
        marketplaceId: link.marketplaceId,
        source: normalizedSource as never
      }
    });

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

    await this.prisma.affiliateLink.update({ where: { id: link.id }, data: { clicks: { increment: 1 }, clickCount: { increment: 1 } } });
    return link.affiliateUrl ?? link.url;
  }

  async trackAndResolve(shortCode: string, source: string): Promise<{ url: string; link: any }> {
    const link = await this.prisma.affiliateLink.findUnique({ where: { shortCode }, include: { listing: true, product: true, marketplace: true } });
    if (!link) throw new NotFoundException('Affiliate link not found');

    const url = await this.track(link, source);
    return { url, link };
  }

  async trackAndResolveById(affiliateId: string, source: string): Promise<{ url: string; link: any }> {
    const link = await this.prisma.affiliateLink.findUnique({ where: { id: affiliateId }, include: { listing: true, product: true, marketplace: true } });
    if (!link) throw new NotFoundException('Affiliate link not found');

    const url = await this.track(link, source);
    return { url, link };
  }
}
