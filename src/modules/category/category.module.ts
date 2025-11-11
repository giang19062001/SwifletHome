import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryRepository } from './category.repository';
import { CategoryController } from './category.controller';
import { AuthAdminModule } from 'src/modules/auth/admin/auth.module';

@Module({
  imports: [AuthAdminModule],
  controllers: [CategoryController],
  providers: [CategoryService, CategoryRepository],
  exports:[CategoryService]
})
export class CategoryModule {}
