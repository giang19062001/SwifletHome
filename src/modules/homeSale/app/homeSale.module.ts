import { Module } from '@nestjs/common';
import { HomeSaleAppController } from './homeSale.controller';
import { HomeSaleAppRepository } from './homeSale.repository';
import { HomeSaleAppService } from './homeSale.service';
import { AuthAppModule } from 'src/modules/auth/app/auth.module';

@Module({
  imports: [AuthAppModule],
  controllers: [HomeSaleAppController],
  providers: [HomeSaleAppService, HomeSaleAppRepository],
  exports: [HomeSaleAppService],
})
export class HomeSaleAppModule {}
