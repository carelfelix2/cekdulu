import { IsOptional, IsString } from 'class-validator';

export class ScrapedProductQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsString()
  marketplaceId?: string;

  @IsOptional()
  @IsString()
  status?: string;
}