import { Module } from "@nestjs/common";
import { UserAppService } from "./user.service";
import { UserAppRepository } from "./user.repository";

@Module({
  imports:[],
  providers: [UserAppService, UserAppRepository],
  exports: [UserAppService],
})
export class UserAppModule {}
