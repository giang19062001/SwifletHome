import { Module } from '@nestjs/common';
import { CategoryAdminService } from './category.service';
import { CategoryAdminRepository } from './category.repository';
import { CategoryAdminController } from './category.controller';
import { AuthAdminModule } from 'src/modules/auth/admin/auth.module';

@Module({
  imports: [AuthAdminModule],
  controllers: [CategoryAdminController],
  providers: [CategoryAdminService, CategoryAdminRepository],
  exports:[CategoryAdminService]
})
export class CategoryAdminModule {}
