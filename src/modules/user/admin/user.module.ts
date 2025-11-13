import { Module } from "@nestjs/common";
import { UserAdminService } from "./user.service";
import { UserAdminRepository } from "./user.repository";

@Module({
  providers: [UserAdminService, UserAdminRepository],
  exports: [UserAdminService],
})
export class UserAdminModule {}
