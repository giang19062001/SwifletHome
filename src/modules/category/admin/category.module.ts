import { Module } from '@nestjs/common';
import { AuthAdminModule } from 'src/modules/auth/admin/auth.module';
import { CategoryAdminController } from './category.controller';
import { CategoryAdminRepository } from './category.repository';
import { CategoryAdminService } from './category.service';

@Module({
  imports: [AuthAdminModule],
  controllers: [CategoryAdminController],
  providers: [CategoryAdminService, CategoryAdminRepository],
  exports:[CategoryAdminService]
})
export class CategoryAdminModule {}
