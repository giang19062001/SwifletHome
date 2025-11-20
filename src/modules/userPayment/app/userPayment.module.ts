import { Module } from "@nestjs/common";
import { UserPaymentAppService } from "./userPayment.service";
import { UserPaymentAppRepository } from "./userPayment.repository";

@Module({
  imports: [],
  providers: [UserPaymentAppService, UserPaymentAppRepository],
  exports: [UserPaymentAppService],
})
export class UserPaymentAppModule {}
