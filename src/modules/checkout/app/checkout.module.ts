import { Module } from '@nestjs/common';
import { PackageAdminModule } from 'src/modules/package/admin/package.module';
import { CheckoutAppController } from './checkout.controller';
import { CheckoutAppRepository } from './checkout.repository';
import { CheckoutAppService } from './checkout.service';

@Module({
  imports: [PackageAdminModule],
  controllers: [CheckoutAppController],
  providers: [CheckoutAppService, CheckoutAppRepository],
  exports: [CheckoutAppService],
})
export class CheckoutAppModule {}
