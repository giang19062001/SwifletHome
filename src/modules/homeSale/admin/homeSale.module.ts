import { Module } from '@nestjs/common';
import { AuthAdminModule } from 'src/modules/auth/admin/auth.module';
import { HomeSaleAdminController } from './homeSale.controller';
import { HomeSaleAdminRepository } from './homeSale.repository';
import { HomeSaleAdminService } from './homeSale.service';
import { FileLocalModule } from 'src/common/fileLocal/fileLocal.module';

@Module({
  imports: [AuthAdminModule, FileLocalModule],
  controllers: [HomeSaleAdminController],
  providers: [HomeSaleAdminService, HomeSaleAdminRepository],
  exports:[HomeSaleAdminService]
})
export class HomeSaleAdminModule {}
