import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import type { CreateMarketplaceDto } from './dto/create-marketplace.dto';
import type { UpdateMarketplaceDto } from './dto/update-marketplace.dto';

@Injectable()
export class MarketplacesService {
  constructor(private readonly prismaService: PrismaService) {}

  private get prisma() {
    return this.prismaService.client;
  }

  list() {
    return this.prisma.marketplace.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: {
            affiliateLinks: true,
            productPrices: true,
            scrapingJobs: true,
            scrapedProducts: true
          }
        }
      }
    });
  }

  async create(dto: CreateMarketplaceDto) {
    const existing = await this.prisma.marketplace.findFirst({ where: { OR: [{ slug: dto.slug }, { name: dto.name }] } });
    if (existing) throw new BadRequestException('Marketplace already exists');

    return this.prisma.marketplace.create({
      data: {
        slug: dto.slug.toLowerCase().replace(/\s+/g, '-'),
        name: dto.name,
        displayName: dto.displayName ?? dto.name,
        color: dto.color ?? '#111827',
        baseUrl: dto.baseUrl,
        logoUrl: dto.logoUrl,
        active: dto.isActive ?? true,
        isActive: dto.isActive ?? true,
        affiliateEnabled: true
      }
    });
  }

  async update(id: string, dto: UpdateMarketplaceDto) {
    const marketplace = await this.prisma.marketplace.findUnique({ where: { id } });
    if (!marketplace) throw new NotFoundException('Marketplace not found');

    return this.prisma.marketplace.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.slug ? { slug: dto.slug.toLowerCase().replace(/\s+/g, '-') } : {}),
        ...(dto.displayName ? { displayName: dto.displayName } : {}),
        ...(dto.color ? { color: dto.color } : {}),
        ...(dto.baseUrl ? { baseUrl: dto.baseUrl } : {}),
        ...(dto.logoUrl ? { logoUrl: dto.logoUrl } : {}),
        ...(typeof dto.isActive === 'boolean' ? { active: dto.isActive, isActive: dto.isActive } : {})
      }
    });
  }

  async toggle(id: string, isActive: boolean) {
    const marketplace = await this.prisma.marketplace.findUnique({ where: { id } });
    if (!marketplace) throw new NotFoundException('Marketplace not found');

    return this.prisma.marketplace.update({ where: { id }, data: { active: isActive, isActive } });
  }

  async remove(id: string) {
    const marketplace = await this.prisma.marketplace.findUnique({ where: { id } });
    if (!marketplace) throw new NotFoundException('Marketplace not found');

    return this.prisma.marketplace.delete({ where: { id } });
  }
}