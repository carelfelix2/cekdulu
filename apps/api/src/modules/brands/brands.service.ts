import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class BrandsService {
  constructor(private readonly prismaService: PrismaService) {}

  private get prisma() {
    return this.prismaService.client;
  }

  list(): Promise<any[]> {
    return this.prisma.brand.findMany({ orderBy: { name: 'asc' } });
  }

  create(data: { slug: string; name: string; logoUrl?: string; description?: string }): Promise<any> {
    return this.prisma.brand.create({ data });
  }

  update(id: string, data: Partial<{ name: string; logoUrl?: string; description?: string }>): Promise<any> {
    return this.prisma.brand.update({ where: { id }, data });
  }

  remove(id: string): Promise<any> {
    return this.prisma.brand.delete({ where: { id } });
  }
}
