import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { prisma } from '@cekdulu/database';
import type { PrismaClient } from '@cekdulu/database';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await prisma.$connect();
      this.logger.log('Prisma connected');
    } catch (err) {
      // Don't crash the whole app on startup if DB connection fails or Prisma Data Proxy validation occurs.
      this.logger.error('Prisma $connect failed on startup:', err as any);
    }
  }

  async onModuleDestroy() {
    try {
      await prisma.$disconnect();
    } catch (e) {
      this.logger.warn('Prisma $disconnect failed', e as any);
    }
  }

  get client(): PrismaClient {
    return prisma;
  }
}
