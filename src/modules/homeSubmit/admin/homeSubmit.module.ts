import { Module } from '@nestjs/common';
import { AuthAdminModule } from 'src/modules/auth/admin/auth.module';
import { HomeSubmitAdminRepository } from './homeSubmit.repository';
import { HomeSubmitAdminService } from './homeSubmit.service';
import { HomeSubmitAdminController } from './homeSubmit.controller';
@Module({
  imports: [AuthAdminModule],
  controllers: [HomeSubmitAdminController],
  providers: [HomeSubmitAdminService, HomeSubmitAdminRepository],
})
export class HomeSubmitAdminModule {}
