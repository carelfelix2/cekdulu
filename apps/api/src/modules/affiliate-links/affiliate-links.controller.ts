import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { AffiliateLinksService } from './affiliate-links.service';

@Controller('affiliate-links')
export class AffiliateLinksController {
  constructor(private readonly affiliateLinksService: AffiliateLinksService) {}

  @Get()
  list(): Promise<any> {
    return this.affiliateLinksService.list();
  }

  @Post()
  create(@Body() body: { productId: string; marketplaceId: string; listingId?: string; url: string; affiliateUrl?: string; campaignName?: string; shortCode: string; trackingCode: string; isActive?: boolean }): Promise<any> {
    return this.affiliateLinksService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Partial<{ url: string; affiliateUrl?: string; campaignName?: string; isPrimary: boolean; isActive: boolean; utmSource?: string; utmMedium?: string; utmCampaign?: string }>): Promise<any> {
    return this.affiliateLinksService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<any> {
    return this.affiliateLinksService.remove(id);
  }
}
