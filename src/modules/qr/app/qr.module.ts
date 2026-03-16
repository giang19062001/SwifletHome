import { Module } from '@nestjs/common';
import QrAppController from './qr.controller';
import { AuthAppModule } from 'src/modules/auth/app/auth.module';
import { UserHomeAppModule } from 'src/modules/userHome/app/userHome.module';
import { TodoAppModule } from 'src/modules/todo/app/todo.module';
import { QrSellAppService } from './qr-sell.service';
import { QrRequestAppService } from './qr-request.service';
import { QrRequestAppRepository } from './qr-request.repository';
import { QrSellAppRepository } from './qr-sell.repository';

@Module({
  imports: [AuthAppModule, TodoAppModule ,UserHomeAppModule],
  controllers: [QrAppController],
  providers: [QrRequestAppService, QrSellAppService, QrRequestAppRepository, QrSellAppRepository],
  exports: [QrRequestAppService],
})
export class QrAppModule {}
