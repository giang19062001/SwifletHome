import { Module } from '@nestjs/common';
import { AuthAppModule } from 'src/modules/auth/app/auth.module';
import { UserAppModule } from 'src/modules/user/app/user.module';
import { DoctorAppController } from './doctor.controller';
import { DoctorAppRepository } from './doctor.repository';
import { DoctorAppService } from './doctor.service';

@Module({
  imports: [AuthAppModule, UserAppModule],
  controllers: [DoctorAppController],
  providers: [DoctorAppService, DoctorAppRepository],
  exports:[DoctorAppService]
})
export class DoctorAppModule{}