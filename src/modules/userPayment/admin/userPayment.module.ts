import { Module } from "@nestjs/common";
import { UserPaymentAdminRepository } from "./userPayment.repository";
import { UserPaymentAdminService } from "./userPayment.service";
import { PackageAdminModule } from "src/modules/package/admin/package.module";

@Module({
  imports: [PackageAdminModule],
  providers: [UserPaymentAdminService, UserPaymentAdminRepository],
  exports: [UserPaymentAdminService],
})
export class UserPaymentAdminModule {}
