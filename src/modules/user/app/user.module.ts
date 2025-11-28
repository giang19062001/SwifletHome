import { Module } from "@nestjs/common";
import { UserAppService } from "./user.service";
import { UserAppRepository } from "./user.repository";
import { NotificationAppModule } from "src/modules/notification/notification.module";

@Module({
  imports:[NotificationAppModule],
  providers: [UserAppService, UserAppRepository],
  exports: [UserAppService, UserAppRepository],
})
export class UserAppModule {}
