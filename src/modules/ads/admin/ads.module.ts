import { Module } from '@nestjs/common';
import { AuthAdminModule } from 'src/modules/auth/admin/auth.module';
import { AdsAdminController } from './ads.controller';
import { AdsAdminRepository } from './ads.repository';
import { AdsAdminService } from './ads.service';

@Module({
  imports: [AuthAdminModule],
  controllers: [AdsAdminController],
  providers: [AdsAdminService, AdsAdminRepository],
  exports: [AdsAdminService],
})
export class AdsAdminModule {}
