import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import type { CreateProductPriceDto } from './dto/create-product-price.dto';
import type { UpdateProductPriceDto } from './dto/update-product-price.dto';

@Injectable()
export class ProductPricesService {
  constructor(private readonly prismaService: PrismaService) {}

  private get prisma() {
    return this.prismaService.client;
  }

  list(filters: { productId?: string; marketplaceId?: string }) {
    return this.prisma.productPrice.findMany({
      where: {
        ...(filters.productId ? { productId: filters.productId } : {}),
        ...(filters.marketplaceId ? { marketplaceId: filters.marketplaceId } : {})
      },
      orderBy: [{ price: 'asc' }, { scrapedAt: 'desc' }],
      include: { product: true, marketplace: true }
    });
  }

  async cheapest(productId: string) {
    const [price] = await this.prisma.productPrice.findMany({
      where: { productId },
      orderBy: [{ price: 'asc' }, { scrapedAt: 'desc' }],
      take: 1,
      include: { product: true, marketplace: true }
    });

    return price ?? null;
  }

  create(dto: CreateProductPriceDto) {
    return this.prisma.productPrice.create({
      data: {
        productId: dto.productId,
        marketplaceId: dto.marketplaceId,
        price: dto.price,
        originalPrice: dto.originalPrice,
        discount: dto.discount ?? 0,
        rating: dto.rating ?? 0,
        soldCount: dto.soldCount ?? 0,
        reviewCount: dto.reviewCount ?? 0,
        sellerName: dto.sellerName,
        productUrl: dto.productUrl,
        isActive: dto.isActive ?? true
      }
    });
  }

  async update(id: string, dto: UpdateProductPriceDto) {
    const price = await this.prisma.productPrice.findUnique({ where: { id } });
    if (!price) throw new NotFoundException('Price not found');

    return this.prisma.productPrice.update({
      where: { id },
      data: {
        ...(dto.productId ? { productId: dto.productId } : {}),
        ...(dto.marketplaceId ? { marketplaceId: dto.marketplaceId } : {}),
        ...(dto.price !== undefined ? { price: dto.price } : {}),
        ...(dto.originalPrice !== undefined ? { originalPrice: dto.originalPrice } : {}),
        ...(dto.discount !== undefined ? { discount: dto.discount } : {}),
        ...(dto.rating !== undefined ? { rating: dto.rating } : {}),
        ...(dto.soldCount !== undefined ? { soldCount: dto.soldCount } : {}),
        ...(dto.reviewCount !== undefined ? { reviewCount: dto.reviewCount } : {}),
        ...(dto.sellerName !== undefined ? { sellerName: dto.sellerName } : {}),
        ...(dto.productUrl !== undefined ? { productUrl: dto.productUrl } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {})
      }
    });
  }

  async remove(id: string) {
    const price = await this.prisma.productPrice.findUnique({ where: { id } });
    if (!price) throw new NotFoundException('Price not found');

    return this.prisma.productPrice.delete({ where: { id } });
  }
}