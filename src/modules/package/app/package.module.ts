import { Module } from "@nestjs/common";
import { PackageAppRepository } from "./package.repository";
import { PackageAppService } from "./package.service";

@Module({
  providers: [PackageAppService, PackageAppRepository],
  exports: [PackageAppService],
})
export class PackageAppModule {}
