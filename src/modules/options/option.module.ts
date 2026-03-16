import { Global, Module } from "@nestjs/common";
import OptionController from "./option.controller";
import { OptionRepository } from "./option.repository";
import { OptionService } from "./option.service";

@Global() 
@Module({
  controllers: [OptionController],
  providers: [OptionService, OptionRepository],
  exports:[OptionService]
})
export class OptionModule {}
