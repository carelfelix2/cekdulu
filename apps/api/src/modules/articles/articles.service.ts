import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class ArticlesService {
  constructor(private readonly prismaService: PrismaService) {}

  private get prisma() {
    return this.prismaService.client;
  }

  list() {
    return this.prisma.article.findMany({ include: { category: true, tags: { include: { tag: true } } }, orderBy: { updatedAt: 'desc' }, take: 100 });
  }

  published() {
    return this.prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      include: { category: true },
      orderBy: { publishedAt: 'desc' },
      take: 20
    });
  }

  async detail(slug: string) {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      include: { category: true, tags: { include: { tag: true } }, faqItems: true, author: true }
    });

    if (!article) throw new NotFoundException('Article not found');
    return article;
  }

  create(data: Record<string, unknown>) {
    return this.prisma.article.create({ data: data as never });
  }

  update(id: string, data: Record<string, unknown>) {
    return this.prisma.article.update({ where: { id }, data: data as never });
  }

  remove(id: string) {
    return this.prisma.article.delete({ where: { id } });
  }
}
