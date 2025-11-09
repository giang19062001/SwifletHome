import { Module } from '@nestjs/common';
import { AuthModule } from 'src/modules/auth/admin/auth.module';
import { HomeAdminController } from './home.controller';
import { HomeAdminRepository } from './home.repository';
import { HomeAdminService } from './home.service';
import { UploadModule } from 'src/modules/upload/upload.module';

@Module({
  imports: [AuthModule, UploadModule],
  controllers: [HomeAdminController],
  providers: [HomeAdminService, HomeAdminRepository],
  exports:[HomeAdminService]
})
export class HomeAdminModule {}
