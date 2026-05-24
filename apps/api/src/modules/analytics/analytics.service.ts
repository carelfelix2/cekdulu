import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prismaService: PrismaService) {}

  private get prisma() {
    return this.prismaService.client;
  }

  track(data: { type: string; productId?: string; marketplaceId?: string; articleId?: string; sessionId?: string; properties?: Record<string, unknown> }): Promise<any> {
    return this.prisma.analyticsEvent.create({
      data: {
        type: data.type as never,
        productId: data.productId,
        marketplaceId: data.marketplaceId,
        articleId: data.articleId,
        sessionId: data.sessionId,
        properties: data.properties ? (data.properties as never) : undefined
      }
    });
  }

  async dashboard(): Promise<{ products: number; articles: number; deals: number; clicks: number }> {
    const [products, articles, deals, clicks] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.article.count(),
      this.prisma.deal.count(),
      this.prisma.redirectClick.count()
    ]);

    return { products, articles, deals, clicks };
  }

  async summary() {
    const [totalAffiliateClicks, clicksPerMarketplace, clicksPerProduct, latestClicks, totalJobs, successJobs, failedJobs, publishedProducts] = await Promise.all([
      this.prisma.affiliateClick.count(),
      this.prisma.affiliateClick.groupBy({
        by: ['marketplaceId'],
        _count: { marketplaceId: true },
        orderBy: { _count: { marketplaceId: 'desc' } }
      }),
      this.prisma.affiliateClick.groupBy({
        by: ['productId'],
        _count: { productId: true },
        orderBy: { _count: { productId: 'desc' } },
        where: { productId: { not: null } }
      }),
      this.prisma.affiliateClick.findMany({ take: 10, orderBy: { clickedAt: 'desc' }, include: { product: true, marketplace: true, affiliateLink: true } }),
      this.prisma.scrapingJob.count(),
      this.prisma.scrapingJob.count({ where: { status: 'SUCCESS' } }),
      this.prisma.scrapingJob.count({ where: { status: 'FAILED' } }),
      this.prisma.product.count({ where: { status: 'PUBLISHED' } })
    ]);

    const marketplaceRecords = await this.prisma.marketplace.findMany({ where: { id: { in: clicksPerMarketplace.map((item) => item.marketplaceId) } }, select: { id: true, name: true, slug: true } });
    const productRecords = await this.prisma.product.findMany({ where: { id: { in: clicksPerProduct.map((item) => item.productId).filter((value): value is string => !!value) } }, select: { id: true, name: true, slug: true, imageUrl: true } });

    return {
      totalAffiliateClicks,
      clicksPerMarketplace: clicksPerMarketplace.map((item) => ({
        marketplaceId: item.marketplaceId,
        count: item._count.marketplaceId,
        marketplace: marketplaceRecords.find((marketplace) => marketplace.id === item.marketplaceId) ?? null
      })),
      clicksPerProduct: clicksPerProduct.map((item) => ({
        productId: item.productId,
        count: item._count.productId,
        product: productRecords.find((product) => product.id === item.productId) ?? null
      })),
      topProductByClicks: clicksPerProduct[0] ?? null,
      latestClicks,
      scrapingJobs: {
        totalJobs,
        successJobs,
        failedJobs
      },
      publishedProducts
    };
  }
}
