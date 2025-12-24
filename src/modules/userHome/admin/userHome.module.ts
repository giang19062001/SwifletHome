import { Module } from "@nestjs/common";
import { AuthAdminModule } from "src/modules/auth/admin/auth.module";
import { UserHomeAdminController } from "./userHome.controller";
import { UserHomeAdminRepository } from "./userHome.repository";
import { UserHomeAdminService } from "./userHome.service";

@Module({
  imports: [AuthAdminModule],
  controllers: [UserHomeAdminController],
  providers: [UserHomeAdminService, UserHomeAdminRepository],
  exports: [UserHomeAdminRepository],
})
export class UserHomeAdminModule {}
