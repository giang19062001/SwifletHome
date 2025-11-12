import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { DoctorAdminController } from './doctor.controller';
import { UploadAdminModule } from 'src/modules/upload/upload.module';
import { AuthAdminModule } from 'src/modules/auth/admin/auth.module';
import { DoctorAppService } from './doctor.service';
import { DoctorAppRepository } from './doctor.repository';

@Module({
  imports: [AuthAdminModule, UploadAdminModule],
  controllers: [DoctorAdminController],
  providers: [DoctorAppService, DoctorAppRepository],
})
export class DoctorAppModule{}