import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { DoctorAppController } from './doctor.controller';
import { DoctorAppService } from './doctor.service';
import { DoctorAppRepository } from './doctor.repository';
import { AuthAppModule } from 'src/modules/auth/app/auth.module';
import { UserAppModule } from 'src/modules/user/app/user.module';

@Module({
  imports: [AuthAppModule, UserAppModule],
  controllers: [DoctorAppController],
  providers: [DoctorAppService, DoctorAppRepository],
})
export class DoctorAppModule{}