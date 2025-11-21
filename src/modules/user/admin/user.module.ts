import { AuthAdminModule } from './../../auth/admin/auth.module';
import { forwardRef, Module } from '@nestjs/common';
import { UserAdminService } from './user.service';
import { UserAdminRepository } from './user.repository';
import { UserAdminController } from './user.controller';
import { PackageAdminModule } from 'src/modules/package/admin/package.module';
import { FirebaseModule } from 'src/common/firebase/firebase.module';

@Module({
  imports:[PackageAdminModule, FirebaseModule, forwardRef(() => AuthAdminModule)], // ← phá phụ thuộc vòng tròn
  controllers: [UserAdminController],
  providers: [UserAdminService, UserAdminRepository],
  exports: [UserAdminService],
})
export class UserAdminModule {}
