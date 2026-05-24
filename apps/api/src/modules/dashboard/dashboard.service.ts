import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prismaService: PrismaService) {}

  private get prisma() {
    return this.prismaService.client;
  }

  async adminSummary() {
    const [products, marketplaces, affiliateLinks, articles, scrapedProducts, totalAffiliateClicks, latestScrapedProducts, recentClicks, topProducts, jobs] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.marketplace.count(),
      this.prisma.affiliateLink.count(),
      this.prisma.article.count(),
      this.prisma.scrapedProduct.count(),
      this.prisma.affiliateClick.count(),
      this.prisma.scrapedProduct.findMany({
        take: 8,
        orderBy: { scrapedAt: 'desc' },
        include: { marketplace: true, matchedProduct: true }
      }),
      this.prisma.affiliateClick.findMany({
        take: 12,
        orderBy: { clickedAt: 'desc' },
        include: { marketplace: true, product: true, affiliateLink: true }
      }),
      this.prisma.affiliateClick.groupBy({
        by: ['productId'],
        _count: { productId: true },
        orderBy: { _count: { productId: 'desc' } },
        take: 8,
        where: { productId: { not: null } }
      }),
      this.prisma.scrapingJob.groupBy({
        by: ['status'],
        _count: { status: true }
      })
    ]);

    const topProductIds = topProducts.map((item) => item.productId).filter((value): value is string => !!value);
    const topProductRecords = topProductIds.length
      ? await this.prisma.product.findMany({
          where: { id: { in: topProductIds } },
          select: { id: true, name: true, slug: true, imageUrl: true, worthItScore: true }
        })
      : [];

    return {
      totals: {
        products,
        marketplaces,
        affiliateLinks,
        articles,
        scrapedProducts
      },
      latestScrapedProducts,
      recentAffiliateClicks: recentClicks,
      topClickedProducts: topProducts.map((item) => ({
        productId: item.productId,
        count: item._count.productId,
        product: topProductRecords.find((record) => record.id === item.productId) ?? null
      })),
      scrapingStatusSummary: jobs.map((job) => ({
        status: job.status,
        total: job._count.status
      })),
      analytics: {
        totalAffiliateClicks,
        totalScrapingJobs: await this.prisma.scrapingJob.count(),
        successScrapingJobs: await this.prisma.scrapingJob.count({ where: { status: 'SUCCESS' } }),
        failedScrapingJobs: await this.prisma.scrapingJob.count({ where: { status: 'FAILED' } }),
        totalProductsPublished: await this.prisma.product.count({ where: { status: 'PUBLISHED' } })
      }
    };
  }
}