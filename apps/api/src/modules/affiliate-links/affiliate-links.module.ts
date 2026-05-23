import { Module } from '@nestjs/common';
import { AffiliateLinksController } from './affiliate-links.controller';
import { AffiliateLinksService } from './affiliate-links.service';

@Module({
  controllers: [AffiliateLinksController],
  providers: [AffiliateLinksService]
})
export class AffiliateLinksModule {}
