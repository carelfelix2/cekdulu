import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { OpenSearchService } from '../../common/opensearch.service';

@Module({
  controllers: [SearchController],
  providers: [SearchService, OpenSearchService]
})
export class SearchModule {}
