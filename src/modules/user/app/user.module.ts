import { Module } from "@nestjs/common";
import { DatabaseModule } from "src/database/database.module";
import { UserAppRepository } from "./user.repository";
import { UserAppService } from "./user.service";

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [UserAppService, UserAppRepository],
  exports:[UserAppService]
})
export class UserAppModule {}
