import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prismaService: PrismaService) {}

  private get prisma() {
    return this.prismaService.client;
  }

  track(data: { type: string; productId?: string; marketplaceId?: string; articleId?: string; sessionId?: string; properties?: Record<string, unknown> }) {
    return this.prisma.analyticsEvent.create({
      data: {
        type: data.type as never,
        productId: data.productId,
        marketplaceId: data.marketplaceId,
        articleId: data.articleId,
        sessionId: data.sessionId,
        properties: data.properties ?? {}
      }
    });
  }

  async dashboard() {
    const [products, articles, deals, clicks] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.article.count(),
      this.prisma.deal.count(),
      this.prisma.redirectClick.count()
    ]);

    return { products, articles, deals, clicks };
  }
}
