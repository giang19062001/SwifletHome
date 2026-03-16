import { forwardRef, Module } from '@nestjs/common';
import { PackageAdminModule } from 'src/modules/package/admin/package.module';
import { AuthAdminModule } from './../../auth/admin/auth.module';
import { UserAdminController } from './user.controller';
import { UserAdminRepository } from './user.repository';
import { UserAdminService } from './user.service';

@Module({
  imports:[PackageAdminModule, forwardRef(() => AuthAdminModule)], // ← phá phụ thuộc vòng tròn
  controllers: [UserAdminController],
  providers: [UserAdminService, UserAdminRepository],
  exports: [UserAdminService],
})
export class UserAdminModule {}
