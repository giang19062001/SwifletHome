import { Global, Module } from "@nestjs/common";
import { OptionService } from "./option.service";
import { OptionRepository } from "./option.repository";
import OptionController from "./option.controller";

@Global() 
@Module({
  controllers: [OptionController],
  providers: [OptionService, OptionRepository],
  exports:[OptionService]
})
export class OptionModule {}
