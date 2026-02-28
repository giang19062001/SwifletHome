import { Module } from '@nestjs/common';
import QrAppController from './qr.controller';
import { QrAppService } from './qr.service';
import { QrAppRepository } from './qr.repository';
import { AuthAppModule } from 'src/modules/auth/app/auth.module';
import { UserHomeAppModule } from 'src/modules/userHome/app/userHome.module';
import { TodoAppModule } from 'src/modules/todo/app/todo.module';

@Module({
  imports: [AuthAppModule, TodoAppModule ,UserHomeAppModule],
  controllers: [QrAppController],
  providers: [QrAppService, QrAppRepository],
  exports: [QrAppRepository, QrAppService],
})
export class QrAppModule {}
