import { Module } from '@nestjs/common';
import { AuthAppModule } from 'src/modules/auth/app/auth.module';
import { TodoAppModule } from 'src/modules/todo/app/todo.module';
import { UserHomeAppModule } from 'src/modules/userHome/app/userHome.module';
import { QrRequestAppRepository } from './qr-request.repository';
import { QrRequestAppService } from './qr-request.service';
import { QrSellAppRepository } from './qr-sell.repository';
import { QrSellAppService } from './qr-sell.service';
import QrAppController from './qr.controller';

@Module({
  imports: [AuthAppModule, TodoAppModule ,UserHomeAppModule],
  controllers: [QrAppController],
  providers: [QrRequestAppService, QrSellAppService, QrRequestAppRepository, QrSellAppRepository],
  exports: [QrRequestAppService],
})
export class QrAppModule {}
