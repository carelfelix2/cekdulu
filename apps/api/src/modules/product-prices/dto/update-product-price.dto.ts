import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateProductPriceDto {
	@IsOptional()
	@IsString()
	productId?: string;

	@IsOptional()
	@IsString()
	marketplaceId?: string;

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	price?: number;

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	originalPrice?: number;

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	discount?: number;

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	rating?: number;

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	soldCount?: number;

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	reviewCount?: number;

	@IsOptional()
	@IsString()
	sellerName?: string;

	@IsOptional()
	@IsString()
	productUrl?: string;

	@IsOptional()
	@IsBoolean()
	isActive?: boolean;
}