import { Module, forwardRef } from '@nestjs/common';
import { AuthAdminModule } from 'src/modules/auth/admin/auth.module';
import { UploadAdminModule } from 'src/modules/upload/admin/upload.module';
import { ScreenAdminController } from './screen.controller';
import { ScreenAdminRepository } from './screen.repository';
import { ScreenAdminService } from './screen.service';

@Module({
  imports: [AuthAdminModule, forwardRef(() => UploadAdminModule)],
  controllers: [ScreenAdminController],
  providers: [ScreenAdminService, ScreenAdminRepository],
  exports: [ScreenAdminService],
})
export class ScreenAdminModule {}
