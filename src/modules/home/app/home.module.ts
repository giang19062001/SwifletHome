import { Module } from "@nestjs/common";
import { DatabaseModule } from "src/database/database.module";
import { HomeAppController } from "./home.controller";
import { HomeAppRepository } from "./home.repository";
import { HomeAppService } from "./home.service";

@Module({
  imports: [DatabaseModule],
  controllers: [HomeAppController],
  providers: [HomeAppService, HomeAppRepository],
})
export class HomeAppModule {}
