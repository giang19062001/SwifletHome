import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { contractABI } from 'src/config/contract.config';
import { LoggingService } from '../logger/logger.service';

@Injectable()
export class ContractService implements OnModuleInit {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;
  private readonly SERVICE_NAME = 'ContractService';

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggingService,
  ) {}

  onModuleInit() {
    const rpcUrl = this.configService.get<string>('RPC_URL')!;
    const privateKey = this.configService.get<string>('PRIVATE_KEY_WALLET')!;
    const contractAddress = this.configService.get<string>('CONTRACT_ADDRESS')!;

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.contract = new ethers.Contract(contractAddress, contractABI, this.wallet);
  }


  async recordJson(data: any) {
    try {
      const jsonData = JSON.stringify(data);

      const tx = await this.contract.recordJson(jsonData);
      this.logger.log(this.SERVICE_NAME, `Transaction Hash: ${tx.hash}`);

      const receipt = await tx.wait();

      this.logger.log(this.SERVICE_NAME, `Transaction mined in block: ${receipt.blockNumber}`);
      this.logger.log(this.SERVICE_NAME, `Gas used:: ${receipt.gasUsed.toString()}`);

      const gasPrice = tx.gasPrice || (await this.provider.getFeeData()).gasPrice;

      let transactionFee = "0"
      if (gasPrice) {
        const txFee = receipt.gasUsed * gasPrice;
        transactionFee = txFee.toString()
        this.logger.log(this.SERVICE_NAME, `Transaction fee: ${txFee.toString()}`);
      }

      return {
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        transactionFee: transactionFee
      };
    } catch (error) {
      this.logger.log(this.SERVICE_NAME, `error: ${error.toString()}`);
      return {
        transactionHash: '',
        blockNumber: '',
        transactionFee: '0',
      };
    }
  }
}

//* ghi blockchain ( không đợi )
// setImmediate(() => {
//   this.contractService.recordJson(dto).catch((err) => this.logger.error(logbase, `Blockchain error: ${err}`));
// });
