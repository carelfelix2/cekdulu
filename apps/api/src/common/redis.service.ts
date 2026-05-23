import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis | null = null;

  get connection() {
    if (!this.client) {
      this.client = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
        maxRetriesPerRequest: 2,
        enableReadyCheck: true
      });
    }
    return this.client;
  }

  async get<T = string>(key: string) {
    return this.connection.get(key) as Promise<T | null>;
  }

  async set(key: string, value: string, ttlSeconds = 60) {
    return this.connection.set(key, value, 'EX', ttlSeconds);
  }

  async del(key: string) {
    return this.connection.del(key);
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
    }
  }
}
