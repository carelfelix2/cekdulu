import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import type { RunScrapeDto } from './dto/run-scrape.dto';

@Injectable()
export class ScrapingService {
  constructor(private readonly prismaService: PrismaService) {}

  private get prisma() {
    return this.prismaService.client;
  }

  async jobs() {
    return this.prisma.scrapingJob.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { marketplace: true, _count: { select: { scrapedProducts: true } } }
    });
  }

  async runManualScrape(dto: RunScrapeDto) {
    const marketplace = await this.prisma.marketplace.findFirst({ where: { OR: [{ id: dto.marketplaceId }, { slug: 'shopee' }] } });
    if (!marketplace) throw new BadRequestException('Marketplace not found');

    const job = await this.prisma.scrapingJob.create({
      data: {
        marketplaceId: marketplace.id,
        keyword: dto.keyword,
        limit: dto.limit,
        source: 'MANUAL',
        status: 'RUNNING',
        startedAt: new Date()
      }
    });

    try {
      const totalFound = Math.max(1, Math.min(dto.limit, 8));
      const items = Array.from({ length: totalFound }, (_, index) => ({
        scrapingJobId: job.id,
        productName: `${dto.keyword} ${marketplace.name} ${index + 1}`,
        productUrl: `https://${marketplace.slug}.example.com/${encodeURIComponent(dto.keyword)}-${index + 1}`,
        imageUrl: `https://picsum.photos/seed/${encodeURIComponent(dto.keyword)}-${index + 1}/800/800`,
        price: 100000 + index * 25000,
        rating: 4.1 + (index % 5) * 0.1,
        soldCount: 12 + index * 5,
        reviewCount: 8 + index * 2,
        shopId: `shop-${marketplace.slug}-${index + 1}`,
        itemId: `item-${job.id}-${index + 1}`,
        marketplaceId: marketplace.id,
        keyword: dto.keyword,
        source: 'manual',
        status: 'PENDING' as const
      }));

      await this.prisma.scrapedProduct.createMany({ data: items as never });

      return this.prisma.scrapingJob.update({
        where: { id: job.id },
        data: {
          totalFound,
          status: 'SUCCESS',
          finishedAt: new Date()
        },
        include: { marketplace: true, scrapedProducts: true }
      });
    } catch (error) {
      return this.prisma.scrapingJob.update({
        where: { id: job.id },
        data: {
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          finishedAt: new Date()
        },
        include: { marketplace: true, scrapedProducts: true }
      });
    }
  }
}