import { Module } from "@nestjs/common";
import { DatabaseModule } from "src/database/database.module";
import { CodeAppRepository } from "./code.repository";
import { CodeAppService } from "./code.service";
import { CodeAppController } from "./code.controller";

@Module({
  imports: [DatabaseModule],
  controllers: [CodeAppController],
  providers: [CodeAppService, CodeAppRepository],
  exports:[CodeAppService]
})
export class CodeAppModule {}
