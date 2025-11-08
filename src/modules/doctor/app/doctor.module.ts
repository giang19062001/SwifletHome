import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { DoctorAdminController } from './doctor.controller';
import { UploadModule } from 'src/modules/upload/upload.module';
import { AuthModule } from 'src/modules/auth/admin/auth.module';
import { DoctorAppService } from './doctor.service';
import { DoctorAppRepository } from './doctor.repository';

@Module({
  imports: [DatabaseModule, AuthModule, UploadModule],
  controllers: [DoctorAdminController],
  providers: [DoctorAppService, DoctorAppRepository],
})
export class DoctorAppModule{}