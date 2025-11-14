import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { DoctorAppController } from './doctor.controller';
import { DoctorAppService } from './doctor.service';
import { DoctorAppRepository } from './doctor.repository';
import { AuthAppModule } from 'src/modules/auth/app/auth.module';

@Module({
  imports: [AuthAppModule],
  controllers: [DoctorAppController],
  providers: [DoctorAppService, DoctorAppRepository],
})
export class DoctorAppModule{}