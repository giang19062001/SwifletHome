import { Module } from "@nestjs/common";
import { CodeController } from "./code.controller";
import { CodeService } from "./code.service";
import { CodeRepository } from "./code.repository";


@Module({
  controllers: [CodeController],
  providers: [CodeService, CodeRepository],
  exports:[CodeService]
})
export class CodeModule {}
