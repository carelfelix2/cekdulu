import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import type { RunScrapingDto } from './dto/run-scraping.dto';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class ScrapingService {
  private readonly logger = new Logger(ScrapingService.name);

  constructor(private readonly prismaService: PrismaService, private readonly queueService: QueueService) {}

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

  async listLogs() {
    return this.prisma.scrapingJob.findMany({ orderBy: { createdAt: 'desc' }, take: 100, include: { marketplace: true, scrapedProducts: true } });
  }

  private getScraperBase() {
    return (process.env.SCRAPER_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');
  }

  async run(dto: RunScrapingDto) {
    // resolve marketplace
    let marketplace = null;
    if (dto.marketplace) {
      marketplace = await this.prisma.marketplace.findFirst({ where: { OR: [{ id: dto.marketplace }, { slug: dto.marketplace }] } });
    }
    if (!marketplace) {
      marketplace = await this.prisma.marketplace.findFirst();
      if (!marketplace) throw new BadRequestException('No marketplace configured');
    }

    const job = await this.prisma.scrapingJob.create({
      data: {
        marketplaceId: marketplace.id,
        keyword: dto.keyword,
        limit: dto.limit,
        source: 'MANUAL',
        status: 'QUEUED',
        createdAt: new Date()
      }
    });

    // If an external scraper API is configured, prefer calling it. Otherwise publish to RMQ queue for local scraper workers.
    const externalBase = process.env.SCRAPER_API_BASE_URL;
    if (externalBase && externalBase !== process.env.API_BASE_URL) {
      const url = `${this.getScraperBase()}/scrape`;
      try {
        const payload = { keyword: dto.keyword, limit: dto.limit, strategy: dto.strategy || 'auto', send_api: true };
        this.logger.log(`Calling scraper ${url} payload=${JSON.stringify(payload)}`);

        const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!res.ok) {
          const text = await res.text();
          await this.prisma.scrapingJob.update({ where: { id: job.id }, data: { status: 'FAILED', finishedAt: new Date(), errorMessage: `Scraper error ${res.status}: ${text}` } });
          return { success: false, jobId: job.id, message: 'Scraper returned error' };
        }

        const items = (await res.json()) as any[];
        let total = 0;

        for (const item of items) {
          if (!item.productUrl) continue;
          total += 1;
          const data = {
            scrapingJobId: job.id,
            productName: item.title || item.productName || item.name || '',
            productUrl: item.productUrl,
            imageUrl: item.imageUrl || item.image || null,
            price: item.price ?? item.offerPrice ?? null,
            rating: item.rating ?? null,
            soldCount: item.soldCount ?? item.sold ?? 0,
            reviewCount: item.reviewCount ?? item.reviews ?? 0,
            shopId: item.shopId ?? null,
            itemId: item.itemId ?? null,
            marketplaceId: marketplace.id,
            keyword: dto.keyword,
            source: dto.strategy ?? 'api',
            rawData: item,
            scrapedAt: new Date()
          } as any;

          const existing = await this.prisma.scrapedProduct.findFirst({ where: { productUrl: item.productUrl } });
          if (existing) {
            await this.prisma.scrapedProduct.update({ where: { id: existing.id }, data });
          } else {
            await this.prisma.scrapedProduct.create({ data });
          }
        }

        await this.prisma.scrapingJob.update({ where: { id: job.id }, data: { status: 'SUCCESS', finishedAt: new Date(), totalFound: total } });
        return { success: true, jobId: job.id, totalFound: total };
      } catch (err: any) {
        this.logger.error('Scraping run failed', err);
        await this.prisma.scrapingJob.update({ where: { id: job.id }, data: { status: 'FAILED', finishedAt: new Date(), errorMessage: String(err?.message || err) } });
        return { success: false, jobId: job.id, message: String(err?.message || err) };
      }
    }

    // Publish to RMQ queue for local workers
    try {
      const payload = { scrapingJobId: job.id, marketplace: marketplace.slug ?? marketplace.id, keyword: dto.keyword, limit: dto.limit, strategy: dto.strategy || 'auto' };
      await this.queueService.publishScrapeJob(payload);
      await this.prisma.scrapingJob.update({ where: { id: job.id }, data: { status: 'QUEUED' } });
      this.logger.log(`Published scrape job ${job.id} to queue`);
      return { success: true, jobId: job.id, queued: true };
    } catch (err: any) {
      this.logger.error('Failed to publish scrape job', err);
      await this.prisma.scrapingJob.update({ where: { id: job.id }, data: { status: 'FAILED', errorMessage: String(err?.message || err), finishedAt: new Date() } });
      return { success: false, jobId: job.id, message: String(err?.message || err) };
    }
  }
}