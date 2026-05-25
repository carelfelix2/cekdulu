import { Module } from '@nestjs/common';
import { ProductImportService } from './product-import.service';
import { ProductImportController } from './product-import.controller';
import { DatabaseModule } from '../../common/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [ProductImportService],
  controllers: [ProductImportController]
})
export class ProductImportModule {}
