import { Injectable, Logger } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);
  private client: ClientProxy | null = null;

  private get queue() {
    if (!this.client) {
      this.client = ClientProxyFactory.create({
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672'],
          queue: 'cekdulu.scraper',
          queueOptions: { durable: true }
        }
      });
    }
    return this.client;
  }

  async publishScrapeJob(payload: Record<string, unknown>) {
    this.logger.log(`Publish scrape job: ${JSON.stringify(payload)}`);
    return firstValueFrom(this.queue.emit('scrape.job', payload));
  }
}
