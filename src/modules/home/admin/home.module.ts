import { Module } from '@nestjs/common';
import { AuthAdminModule } from 'src/modules/auth/admin/auth.module';
import { HomeAdminController } from './home.controller';
import { HomeAdminRepository } from './home.repository';
import { HomeAdminService } from './home.service';
import { UploadAdminModule } from 'src/modules/upload/upload.module';

@Module({
  imports: [AuthAdminModule, UploadAdminModule],
  controllers: [HomeAdminController],
  providers: [HomeAdminService, HomeAdminRepository],
  exports:[HomeAdminService]
})
export class HomeAdminModule {}
