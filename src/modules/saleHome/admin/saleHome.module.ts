import { Module } from '@nestjs/common';
import { SaleHomeAdminController } from './saleHome.controller';
import { SaleHomeAdminService } from './saleHome.service';
import { SaleHomeAdminRepository } from './saleHome.repository';
import { FileLocalModule } from 'src/common/fileLocal/fileLocal.module';
import { AuthAdminModule } from 'src/modules/auth/admin/auth.module';

@Module({
  imports: [FileLocalModule, AuthAdminModule],
  controllers: [SaleHomeAdminController],
  providers: [SaleHomeAdminService, SaleHomeAdminRepository],
  exports: [SaleHomeAdminService],
})
export class SaleHomeAdminModule {}
