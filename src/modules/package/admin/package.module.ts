import { forwardRef, Module } from '@nestjs/common';
import { AuthAdminModule } from 'src/modules/auth/admin/auth.module';
import { PackageAdminController } from './package.controller';
import { PackageAdminService } from './package.service';
import { PackageAdminRepository } from './package.repository';

@Module({
  imports: [forwardRef(() => AuthAdminModule)], // ← phá phụ thuộc vòng tròn
  controllers: [PackageAdminController],
  providers: [PackageAdminService, PackageAdminRepository],
  exports: [PackageAdminService]
})
export class PackageAdminModule {}