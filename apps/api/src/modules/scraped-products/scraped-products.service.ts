import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import type { ScrapedProductQueryDto } from './dto/scraped-product-query.dto';

@Injectable()
export class ScrapedProductsService {
  constructor(private readonly prismaService: PrismaService) {}

  private get prisma() {
    return this.prismaService.client;
  }

  list(query: ScrapedProductQueryDto) {
    return this.prisma.scrapedProduct.findMany({
      where: {
        ...(query.q
          ? {
              OR: [
                { productName: { contains: query.q, mode: 'insensitive' } },
                { productUrl: { contains: query.q, mode: 'insensitive' } }
              ]
            }
          : {}),
        ...(query.keyword ? { keyword: query.keyword } : {}),
        ...(query.marketplaceId ? { marketplaceId: query.marketplaceId } : {}),
        ...(query.status ? { status: query.status as never } : {})
      },
      orderBy: { scrapedAt: 'desc' },
      include: { marketplace: true, matchedProduct: true, scrapingJob: true }
    });
  }

  async setStatus(id: string, status: 'APPROVED' | 'REJECTED') {
    const item = await this.prisma.scrapedProduct.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Scraped product not found');

    return this.prisma.scrapedProduct.update({ where: { id }, data: { status } });
  }

  async convertToProduct(id: string) {
    const item = await this.prisma.scrapedProduct.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Scraped product not found');

    const slug = item.productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `scraped-${id}`;
    const product = await this.prisma.product.create({
      data: {
        name: item.productName,
        slug: `${slug}-${id.slice(0, 6)}`,
        description: `Imported from ${item.marketplaceId} scraping result`,
        imageUrl: item.imageUrl,
        status: 'DRAFT',
        isActive: true,
        isFeatured: false,
        isTrending: false,
        worthItScore: 0
      }
    });

    // create a ProductPrice from scraped item
    try {
      const priceData: any = {
        productId: product.id,
        marketplaceId: item.marketplaceId,
        rating: item.rating ?? 0,
        soldCount: item.soldCount ?? 0,
        reviewCount: item.reviewCount ?? 0,
        productUrl: item.productUrl,
        scrapedAt: item.scrapedAt ?? new Date()
      };
      if (item.price !== undefined && item.price !== null) priceData.price = item.price;

      await this.prisma.productPrice.create({ data: priceData });
    } catch (e) {
      // ignore price creation failures but continue conversion
    }

    return this.prisma.scrapedProduct.update({ where: { id }, data: { matchedProductId: product.id, status: 'APPROVED' } });
  }

  async mergeToProduct(id: string, productId: string) {
    const item = await this.prisma.scrapedProduct.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Scraped product not found');

    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new BadRequestException('Product not found');

    return this.prisma.scrapedProduct.update({ where: { id }, data: { matchedProductId: productId, status: 'APPROVED' } });
  }
}