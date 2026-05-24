import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class RunScrapingDto {
  @IsString()
  keyword!: string;

  @IsInt()
  @Min(1)
  limit!: number;

  @IsOptional()
  @IsString()
  marketplace?: string;

  @IsOptional()
  @IsString()
  strategy?: string;
}
