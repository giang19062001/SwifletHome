import { Module } from '@nestjs/common';
import { ObjectAdminController } from './object.controller';
import { ObjectAdminService } from './object.service';
import { ObjectAdminRepository } from './object.repository';
import { AuthAdminModule } from 'src/modules/auth/admin/auth.module';

@Module({
  imports: [AuthAdminModule],
  controllers: [ObjectAdminController],
  providers: [ObjectAdminService, ObjectAdminRepository],
  exports: [ObjectAdminService]
})
export class ObjectAdminModule {}