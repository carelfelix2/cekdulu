import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class AffiliateLinksService {
  constructor(private readonly prismaService: PrismaService) {}

  private get prisma() {
    return this.prismaService.client;
  }

  list(): Promise<any[]> {
    return this.prisma.affiliateLink.findMany({ include: { marketplace: true, product: true }, orderBy: { createdAt: 'desc' }, take: 100 });
  }

  create(data: { productId: string; marketplaceId: string; listingId?: string; url: string; shortCode: string; trackingCode: string }): Promise<any> {
    return this.prisma.affiliateLink.create({ data });
  }

  update(id: string, data: Partial<{ url: string; isPrimary: boolean; utmSource?: string; utmMedium?: string; utmCampaign?: string }>): Promise<any> {
    return this.prisma.affiliateLink.update({ where: { id }, data });
  }

  remove(id: string): Promise<any> {
    return this.prisma.affiliateLink.delete({ where: { id } });
  }
}
