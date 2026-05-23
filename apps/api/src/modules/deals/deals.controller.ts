import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { DealsService } from './deals.service';

@Controller('deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Get()
  list() {
    return this.dealsService.list();
  }

  @Get('active')
  active() {
    return this.dealsService.active();
  }

  @Get(':slug')
  detail(@Param('slug') slug: string) {
    return this.dealsService.detail(slug);
  }

  @Post()
  create(@Body() body: Record<string, unknown>) {
    return this.dealsService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.dealsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dealsService.remove(id);
  }
}
