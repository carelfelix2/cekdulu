import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateMarketplaceDto } from './dto/create-marketplace.dto';
import { UpdateMarketplaceDto } from './dto/update-marketplace.dto';
import { MarketplacesService } from './marketplaces.service';

@Controller('marketplaces')
export class MarketplacesController {
  constructor(private readonly marketplacesService: MarketplacesService) {}

  @Get()
  list() {
    return this.marketplacesService.list();
  }

  @Post()
  create(@Body() dto: CreateMarketplaceDto) {
    return this.marketplacesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMarketplaceDto) {
    return this.marketplacesService.update(id, dto);
  }

  @Patch(':id/toggle')
  toggle(@Param('id') id: string, @Body() body: { isActive: boolean }) {
    return this.marketplacesService.toggle(id, body.isActive);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.marketplacesService.remove(id);
  }
}