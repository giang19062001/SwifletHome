import { Module } from '@nestjs/common';
import { AuthModule } from 'src/modules/auth/admin/auth.module';
import { BlogAdminController } from './blog.controller';
import { BlogAdminService } from './blog.service';
import { BlogAdminRepository } from './blog.repository';
@Module({
  imports: [AuthModule],
  controllers: [BlogAdminController],
  providers: [BlogAdminService, BlogAdminRepository],
  exports:[BlogAdminService]
})
export class BlogAdminModule {}
