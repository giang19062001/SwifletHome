import { Module } from "@nestjs/common";
import { UserPaymentRepository } from "./userPayment.repository";
import { UserPaymentService } from "./userPayment.service";

@Module({
  providers: [UserPaymentService, UserPaymentRepository],
  exports: [UserPaymentService],
})
export class UserPaymentModule {}
