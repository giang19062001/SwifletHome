import { Module } from '@nestjs/common';
import { AuthAdminModule } from 'src/modules/auth/admin/auth.module';
import { GuestAdminController } from './guest.controller';
import { GuestAdminRepository } from './guest.repository';
import { GuestAdminService } from './guest.service';

@Module({
  imports: [AuthAdminModule],
  controllers: [GuestAdminController],
  providers: [GuestAdminService, GuestAdminRepository],
  exports: [GuestAdminService],
})
export class GuestAdminModule {}
