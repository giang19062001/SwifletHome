import { Module } from "@nestjs/common";
import { DatabaseModule } from "src/database/database.module";
import { CodeController } from "./code.controller";
import { CodeService } from "./code.service";
import { CodeRepository } from "./code.repository";


@Module({
  imports: [DatabaseModule],
  controllers: [CodeController],
  providers: [CodeService, CodeRepository],
  exports:[CodeService]
})
export class CodeModule {}
