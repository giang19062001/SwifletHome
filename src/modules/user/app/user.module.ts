import { Module } from "@nestjs/common";
import { UserAppService } from "./user.service";
import { UserAppRepository } from "./user.repository";
import { UserPaymentAppModule } from "src/modules/userPayment/app/userPayment.module";

@Module({
  imports:[UserPaymentAppModule],
  providers: [UserAppService, UserAppRepository],
  exports: [UserAppService],
})
export class UserAppModule {}
