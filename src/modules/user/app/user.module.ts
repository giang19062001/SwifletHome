import { Module } from "@nestjs/common";
import { UserAppService } from "./user.service";
import { UserAppRepository } from "./user.repository";
import { UserPaymentModule } from "src/modules/userPayment/app/user.module";

@Module({
  imports:[UserPaymentModule],
  providers: [UserAppService, UserAppRepository],
  exports: [UserAppService],
})
export class UserAppModule {}
