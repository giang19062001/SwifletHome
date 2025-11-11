import { Module } from '@nestjs/common';
import { AuthAdminModule } from 'src/modules/auth/admin/auth.module';
import { BlogAdminController } from './blog.controller';
import { BlogAdminService } from './blog.service';
import { BlogAdminRepository } from './blog.repository';
@Module({
  imports: [AuthAdminModule],
  controllers: [BlogAdminController],
  providers: [BlogAdminService, BlogAdminRepository],
  exports:[BlogAdminService]
})
export class BlogAdminModule {}
