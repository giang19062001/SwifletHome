import { Module } from "@nestjs/common";
import { HomeAppController } from "./home.controller";
import { HomeAppRepository } from "./home.repository";
import { HomeAppService } from "./home.service";

@Module({
  controllers: [HomeAppController],
  providers: [HomeAppService, HomeAppRepository],
})
export class HomeAppModule {}
