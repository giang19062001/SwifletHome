import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryRepository } from './category.repository';
import { CategoryController } from './category.controller';
import { DatabaseModule } from 'src/database/database.module';
import { AuthModule } from 'src/modules/auth/admin/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [CategoryController],
  providers: [CategoryService, CategoryRepository],
  exports:[CategoryService]
})
export class CategoryModule {}
