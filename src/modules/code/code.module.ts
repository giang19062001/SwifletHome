import { Global, Module } from "@nestjs/common";
import CodeController from "./code.controller";
import { CodeService } from "./code.service";
import { CodeRepository } from "./code.repository";

@Global() 
@Module({
  controllers: [CodeController],
  providers: [CodeService, CodeRepository],
  exports:[CodeService]
})
export class CodeModule {}
