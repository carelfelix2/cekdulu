import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class MarketsService {
  constructor(private readonly prismaService: PrismaService) {}

  private get prisma() {
    return this.prismaService.client;
  }

  list() {
    return this.prisma.marketplace.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] });
  }

  create(data: { slug: string; name: string; displayName: string; color: string }) {
    return this.prisma.marketplace.create({ data: { ...data, active: true, affiliateEnabled: false } });
  }

  update(id: string, data: Partial<{ name: string; displayName: string; color: string; active: boolean }>) {
    return this.prisma.marketplace.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.marketplace.delete({ where: { id } });
  }
}
