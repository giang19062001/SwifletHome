import { Module } from '@nestjs/common';
import { ScreenAdminController } from './screen.controller';
import { ScreenAdminService } from './screen.service';
import { ScreenAdminRepository } from './screen.repository';
import { AuthAdminModule } from 'src/modules/auth/admin/auth.module';

@Module({
  imports: [AuthAdminModule],
  controllers: [ScreenAdminController],
  providers: [ScreenAdminService, ScreenAdminRepository],
  exports: [ScreenAdminService],
})
export class ScreenAdminModule {}
