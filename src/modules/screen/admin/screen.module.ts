import { Module } from '@nestjs/common';
import { AuthAdminModule } from 'src/modules/auth/admin/auth.module';
import { ScreenAdminController } from './screen.controller';
import { ScreenAdminRepository } from './screen.repository';
import { ScreenAdminService } from './screen.service';

@Module({
  imports: [AuthAdminModule],
  controllers: [ScreenAdminController],
  providers: [ScreenAdminService, ScreenAdminRepository],
  exports: [ScreenAdminService],
})
export class ScreenAdminModule {}
