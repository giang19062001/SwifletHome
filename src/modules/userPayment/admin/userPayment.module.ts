import { Module } from "@nestjs/common";
import { UserPaymentAdminRepository } from "./userPayment.repository";
import { UserPaymentAdminService } from "./userPayment.service";
import { PackageAdminModule } from "src/modules/package/admin/package.module";
import { FirebaseModule } from "src/common/firebase/firebase.module";

@Module({
  imports: [PackageAdminModule, FirebaseModule],
  providers: [UserPaymentAdminService, UserPaymentAdminRepository],
  exports: [UserPaymentAdminService],
})
export class UserPaymentAdminModule {}
