import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { AuthModule } from 'src/modules/auth/admin/auth.module';
import { HomeController } from './home.controller';
import { HomeAdminRepository } from './home.repository';
import { HomeAdminService } from './home.service';
import { UploadModule } from 'src/modules/upload/upload.module';

@Module({
  imports: [DatabaseModule, AuthModule, UploadModule],
  controllers: [HomeController],
  providers: [HomeAdminService, HomeAdminRepository],
  exports:[HomeAdminService]
})
export class HomeAdminModule {}
