import { Module } from '@nestjs/common';
import { SaleHomeAdminController } from './saleHome.controller';
import { SaleHomeAdminService } from './saleHome.service';
import { SaleHomeAdminRepository } from './saleHome.repository';
import { FileLocalModule } from 'src/common/fileLocal/fileLocal.module';
import { AuthAdminModule } from 'src/modules/auth/admin/auth.module';
import { SaleHomeSightseeingAdminController } from './saleHome-sightseeing.controller';
import { SaleHomeSightseeingAdminService } from './saleHome-sightseeing.service';
import { SaleHomeSightseeingAdminRepository } from './saleHome-sightseeing.repository';

@Module({
  imports: [FileLocalModule, AuthAdminModule],
  controllers: [SaleHomeAdminController, SaleHomeSightseeingAdminController],
  providers: [SaleHomeAdminService, SaleHomeAdminRepository, SaleHomeSightseeingAdminService, SaleHomeSightseeingAdminRepository],
  exports: [SaleHomeAdminService],
})
export class SaleHomeAdminModule {}
