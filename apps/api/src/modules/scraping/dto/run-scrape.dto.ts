import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class RunScrapeDto {
  @IsString()
  keyword!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit!: number;

  @IsOptional()
  @IsString()
  marketplaceId?: string;

  @IsOptional()
  @IsIn(['MANUAL'])
  source?: 'MANUAL';
}