import { IsBoolean, IsOptional, IsString, MinLength, IsUrl } from 'class-validator';

export class UpdateMarketplaceDto {
	@IsOptional()
	@IsString()
	@MinLength(2)
	name?: string;

	@IsOptional()
	@IsString()
	@MinLength(2)
	slug?: string;

	@IsOptional()
	@IsString()
	displayName?: string;

	@IsOptional()
	@IsString()
	color?: string;

	@IsOptional()
	@IsUrl({ require_tld: false })
	baseUrl?: string;

	@IsOptional()
	@IsUrl({ require_tld: false })
	logoUrl?: string;

	@IsOptional()
	@IsBoolean()
	isActive?: boolean;
}