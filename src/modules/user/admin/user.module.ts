import { AuthAdminModule } from './../../auth/admin/auth.module';
import { forwardRef, Module } from '@nestjs/common';
import { UserAdminService } from './user.service';
import { UserAdminRepository } from './user.repository';
import { UserAdminController } from './user.controller';
import { UserPaymentAdminModule } from 'src/modules/userPayment/admin/userPayment.module';

@Module({
  imports:[UserPaymentAdminModule, forwardRef(() => AuthAdminModule)], // ← phá phụ thuộc vòng tròn
  controllers: [UserAdminController],
  providers: [UserAdminService, UserAdminRepository],
  exports: [UserAdminService],
})
export class UserAdminModule {}
