import { Module } from '@nestjs/common';
import { AuthAdminModule } from 'src/modules/auth/admin/auth.module';
import { ObjectAdminController } from './object.controller';
import { ObjectAdminRepository } from './object.repository';
import { ObjectAdminService } from './object.service';

@Module({
  imports: [AuthAdminModule],
  controllers: [ObjectAdminController],
  providers: [ObjectAdminService, ObjectAdminRepository],
  exports: [ObjectAdminService]
})
export class ObjectAdminModule {}