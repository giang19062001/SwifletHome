import { Module } from "@nestjs/common";
import { PackageAppService } from "./package.service";
import { PackageAppRepository } from "./package.repository";

@Module({
  providers: [PackageAppService, PackageAppRepository],
  exports: [PackageAppService],
})
export class PackageAppModule {}
