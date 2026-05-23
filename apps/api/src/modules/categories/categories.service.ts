import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prismaService: PrismaService) {}

  private get prisma() {
    return this.prismaService.client;
  }

  list(): Promise<any[]> {
    return this.prisma.category.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] });
  }

  create(data: { slug: string; name: string; description?: string; parentId?: string }): Promise<any> {
    return this.prisma.category.create({ data });
  }

  update(id: string, data: Partial<{ name: string; description?: string; parentId?: string; sortOrder: number }>): Promise<any> {
    return this.prisma.category.update({ where: { id }, data });
  }

  remove(id: string): Promise<any> {
    return this.prisma.category.delete({ where: { id } });
  }
}
