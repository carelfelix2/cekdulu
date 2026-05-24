import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateProductDto {
	@IsOptional()
	@IsString()
	name?: string;

	@IsOptional()
	@IsString()
	slug?: string;

	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@IsString()
	brandId?: string;

	@IsOptional()
	@IsString()
	categoryId?: string;

	@IsOptional()
	@IsString()
	imageUrl?: string;

	@IsOptional()
	@IsString()
	imageAlt?: string;

	@IsOptional()
	@IsIn(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'MERGED'])
	status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'MERGED';

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	worthItScore?: number;

	@IsOptional()
	@IsBoolean()
	isFeatured?: boolean;

	@IsOptional()
	@IsBoolean()
	isTrending?: boolean;

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	popularityScore?: number;
}