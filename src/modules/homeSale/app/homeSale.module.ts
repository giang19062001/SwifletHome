import { Module } from '@nestjs/common';
import { FileLocalModule } from 'src/common/fileLocal/fileLocal.module';
import { AuthAppModule } from 'src/modules/auth/app/auth.module';
import { HomeSaleIndexAppRepository } from './homeSale-index.repository';
import { HomeSaleIndexAppService } from './homeSale-index.service';
import { HomeSaleSightseeingAppRepository } from './homeSale-sightseeing.repository';
import { HomeSaleSightseeingAppService } from './homeSale-sightseeing.service';
import { HomeSaleAppController } from './homeSale.controller';

@Module({
  imports: [AuthAppModule, FileLocalModule],
  controllers: [HomeSaleAppController],
  providers: [HomeSaleIndexAppService, HomeSaleSightseeingAppService, HomeSaleIndexAppRepository, HomeSaleSightseeingAppRepository],
  exports: [],
})
export class HomeSaleAppModule {}
