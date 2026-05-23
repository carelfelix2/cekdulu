import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ArticlesService } from './articles.service';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  list(): Promise<any> {
    return this.articlesService.list();
  }

  @Get('published')
  published(): Promise<any> {
    return this.articlesService.published();
  }

  @Get(':slug')
  detail(@Param('slug') slug: string): Promise<any> {
    return this.articlesService.detail(slug);
  }

  @Post()
  create(@Body() body: Record<string, unknown>): Promise<any> {
    return this.articlesService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Record<string, unknown>): Promise<any> {
    return this.articlesService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<any> {
    return this.articlesService.remove(id);
  }
}
