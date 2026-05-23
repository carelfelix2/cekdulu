import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  list(): Promise<any> {
    return this.categoriesService.list();
  }

  @Post()
  create(@Body() body: { slug: string; name: string; description?: string; parentId?: string }): Promise<any> {
    return this.categoriesService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Partial<{ name: string; description?: string; parentId?: string; sortOrder: number }>): Promise<any> {
    return this.categoriesService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<any> {
    return this.categoriesService.remove(id);
  }
}
