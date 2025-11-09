import { Module } from '@nestjs/common';
import { AuthModule } from 'src/modules/auth/admin/auth.module';
import { HomeSubmitAdminRepository } from './homeSubmit.repository';
import { HomeSubmitAdminService } from './homeSubmit.service';
import { HomeSubmitAdminController } from './homeSubmit.controller';
@Module({
  imports: [AuthModule],
  controllers: [HomeSubmitAdminController],
  providers: [HomeSubmitAdminService, HomeSubmitAdminRepository],
})
export class HomeSubmitAdminModule {}
