import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { RedisService } from '../../common/redis.service';
import { OpenSearchService } from '../../common/opensearch.service';

@Injectable()
export class SearchService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
    private readonly openSearchService: OpenSearchService,
  ) {}

  private get prisma() {
    return this.prismaService.client;
  }

  async search(query: string) {
    const normalized = query.trim();
    if (!normalized) return { products: [], articles: [], deals: [] };

    const cacheKey = `search:${normalized.toLowerCase()}`;
    const cached = await this.redisService.get<string>(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const indexResult = await this.openSearchService.search('cekdulu-products', normalized);

    const [products, articles, deals] = await Promise.all([
      indexResult?.hits?.hits?.length
        ? indexResult.hits.hits.map((hit: { _source?: Record<string, unknown> }) => hit._source)
        : this.prisma.product.findMany({
            where: { OR: [{ name: { contains: normalized, mode: 'insensitive' } }, { slug: { contains: normalized, mode: 'insensitive' } }] },
            take: 10,
            select: { id: true, name: true, slug: true, imageUrl: true, popularityScore: true }
          }),
      this.prisma.article.findMany({
        where: { OR: [{ title: { contains: normalized, mode: 'insensitive' } }, { slug: { contains: normalized, mode: 'insensitive' } }] },
        take: 5,
        select: { id: true, title: true, slug: true, excerpt: true }
      }),
      this.prisma.deal.findMany({
        where: { OR: [{ title: { contains: normalized, mode: 'insensitive' } }, { slug: { contains: normalized, mode: 'insensitive' } }] },
        take: 5,
        select: { id: true, title: true, slug: true, discountPercent: true }
      })
    ]);

    const result = { products, articles, deals };
    await this.redisService.set(cacheKey, JSON.stringify(result), 120);
    return result;
  }

  autocomplete(query: string) {
    return this.search(query).then((result) => result.products.slice(0, 6));
  }
}
