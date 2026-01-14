import { ContractService } from "./contract.service";
import { Module } from '@nestjs/common';

@Module({
  providers: [ContractService],
  exports:[ContractService]
})
export class ContractModule {}
