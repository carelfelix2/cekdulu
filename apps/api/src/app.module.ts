import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './config/env.schema';
import { DatabaseModule } from './common/database.module';
import { RedisModule } from './common/redis.module';
import { HealthController } from './modules/health/health.controller';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { MarketplacesModule } from './modules/marketplaces/marketplaces.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { BrandsModule } from './modules/brands/brands.module';
import { AffiliateLinksModule } from './modules/affiliate-links/affiliate-links.module';
import { ArticlesModule } from './modules/articles/articles.module';
import { DealsModule } from './modules/deals/deals.module';
import { SearchModule } from './modules/search/search.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { QueueModule } from './modules/queue/queue.module';
import { RedirectsModule } from './modules/redirects/redirects.module';
import { ProductPricesModule } from './modules/product-prices/product-prices.module';
import { ScrapingModule } from './modules/scraping/scraping.module';
import { ScrapedProductsModule } from './modules/scraped-products/scraped-products.module';
import { ProductImportModule } from './modules/product-import/product-import.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => envSchema.parse(config)
    }),
    DatabaseModule,
    RedisModule,
    AuthModule,
    DashboardModule,
    ProductsModule,
    MarketplacesModule,
    ProductPricesModule,
    CategoriesModule,
    BrandsModule,
    AffiliateLinksModule,
    ArticlesModule,
    DealsModule,
    SearchModule,
    AnalyticsModule,
    QueueModule,
    ScrapingModule,
    ScrapedProductsModule,
    ProductImportModule,
    RedirectsModule
  ],
  controllers: [HealthController]
})
export class AppModule {}
