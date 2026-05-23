import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { DealsService } from './deals.service';

@Controller('deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Get()
  list(): Promise<any> {
    return this.dealsService.list();
  }

  @Get('active')
  active(): Promise<any> {
    return this.dealsService.active();
  }

  @Get(':slug')
  detail(@Param('slug') slug: string): Promise<any> {
    return this.dealsService.detail(slug);
  }

  @Post()
  create(@Body() body: Record<string, unknown>): Promise<any> {
    return this.dealsService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Record<string, unknown>): Promise<any> {
    return this.dealsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<any> {
    return this.dealsService.remove(id);
  }
}
