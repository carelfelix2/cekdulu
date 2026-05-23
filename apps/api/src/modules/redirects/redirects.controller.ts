import { Controller, Get, Header, Param, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { RedirectsService } from './redirects.service';

@Controller('r')
export class RedirectsController {
  constructor(private readonly redirectsService: RedirectsService) {}

  @Get(':shortCode')
  @Header('Cache-Control', 'no-store')
  async redirect(
    @Param('shortCode') shortCode: string,
    @Query('source') source = 'HOMEPAGE',
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.redirectsService.trackAndResolve(shortCode, source);
    res.redirect(302, result.url);
    return { success: true };
  }
}
