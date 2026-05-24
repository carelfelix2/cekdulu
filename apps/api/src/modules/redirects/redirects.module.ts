import { Module } from '@nestjs/common';
import { RedirectController, RedirectsController } from './redirects.controller';
import { RedirectsService } from './redirects.service';

@Module({
  controllers: [RedirectsController, RedirectController],
  providers: [RedirectsService]
})
export class RedirectsModule {}
