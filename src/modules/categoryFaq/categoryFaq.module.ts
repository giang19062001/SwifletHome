import { Module } from '@nestjs/common';
import { CateFaqService } from './categoryFaq.service';
import { CateFaqRepository } from './categoryFaq.repository';
import { CateFaqController } from './categoryFaq.controller';
import { DatabaseModule } from 'src/database/database.module';
import { AuthModule } from 'src/modules/auth/admin/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [CateFaqController],
  providers: [CateFaqService, CateFaqRepository],
  exports:[CateFaqService]
})
export class CateFaqModule {}
