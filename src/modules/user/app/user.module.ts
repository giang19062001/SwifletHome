import { Module } from "@nestjs/common";
import { UserAppRepository } from "./user.repository";
import { UserAppService } from "./user.service";

@Module({
  imports: [],
  controllers: [],
  providers: [UserAppService, UserAppRepository],
  exports:[UserAppService]
})
export class UserAppModule {}
