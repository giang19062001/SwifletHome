import { Module } from '@nestjs/common';
import { AuthAdminModule } from 'src/modules/auth/admin/auth.module';
import { HomeAdminController } from './home.controller';
import { HomeAdminRepository } from './home.repository';
import { HomeAdminService } from './home.service';
import { FileLocalModule } from 'src/common/fileLocal/fileLocal.module';

@Module({
  imports: [AuthAdminModule, FileLocalModule],
  controllers: [HomeAdminController],
  providers: [HomeAdminService, HomeAdminRepository],
  exports:[HomeAdminService]
})
export class HomeAdminModule {}
