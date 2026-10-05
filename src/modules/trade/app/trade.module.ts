import { Module } from '@nestjs/common';
import { FileLocalModule } from 'src/common/fileLocal/fileLocal.module';
import { AuthAppModule } from 'src/modules/auth/app/auth.module';
import { TradeAppController } from './trade.controller';
import { TradeAppRepository } from './trade.repository';
import { TradeAppService } from './trade.service';

@Module({
  imports: [AuthAppModule, FileLocalModule],
  controllers: [TradeAppController],
  providers: [TradeAppService, TradeAppRepository],
  exports: [TradeAppService, TradeAppRepository],
})
export class TradeAppModule {}
