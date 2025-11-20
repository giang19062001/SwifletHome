import { Module } from "@nestjs/common";
import { UserPaymentService } from "./userPayment.service";
import { UserPaymentRepository } from "./userPayment.repository";

@Module({
  providers: [UserPaymentService, UserPaymentRepository],
  exports: [UserPaymentService],
})
export class UserPaymentModule {}
