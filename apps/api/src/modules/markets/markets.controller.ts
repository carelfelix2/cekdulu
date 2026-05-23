import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { MarketsService } from './markets.service';

@Controller('marketplaces')
export class MarketsController {
  constructor(private readonly marketsService: MarketsService) {}

  @Get()
  list(): Promise<any> {
    return this.marketsService.list();
  }

  @Post()
  create(@Body() body: { slug: string; name: string; displayName: string; color: string }): Promise<any> {
    return this.marketsService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Partial<{ name: string; displayName: string; color: string; active: boolean }>): Promise<any> {
    return this.marketsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<any> {
    return this.marketsService.remove(id);
  }
}
