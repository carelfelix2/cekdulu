import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class DealsService {
  constructor(private readonly prismaService: PrismaService) {}

  private get prisma() {
    return this.prismaService.client;
  }

  list() {
    return this.prisma.deal.findMany({ include: { marketplace: true, product: true }, orderBy: { updatedAt: 'desc' }, take: 100 });
  }

  active() {
    return this.prisma.deal.findMany({
      where: { status: 'ACTIVE' },
      include: { marketplace: true, product: true },
      orderBy: [{ featured: 'desc' }, { endAt: 'asc' }],
      take: 40
    });
  }

  async detail(slug: string) {
    const deal = await this.prisma.deal.findUnique({ where: { slug }, include: { marketplace: true, product: true, listing: true } });
    if (!deal) throw new NotFoundException('Deal not found');
    return deal;
  }

  create(data: Record<string, unknown>) {
    return this.prisma.deal.create({ data: data as never });
  }

  update(id: string, data: Record<string, unknown>) {
    return this.prisma.deal.update({ where: { id }, data: data as never });
  }

  remove(id: string) {
    return this.prisma.deal.delete({ where: { id } });
  }
}
