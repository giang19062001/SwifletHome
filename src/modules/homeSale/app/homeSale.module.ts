import { Module } from '@nestjs/common';
import { HomeSaleAppController } from './homeSale.controller';
import { AuthAppModule } from 'src/modules/auth/app/auth.module';
import { FileLocalModule } from 'src/common/fileLocal/fileLocal.module';
import { HomeSaleIndexAppService } from './homeSale-index.service';
import { HomeSaleSightseeingAppService } from './homeSale-sightseeing.service';
import { HomeSaleIndexAppRepository } from './homeSale-index.repository';
import { HomeSaleSightseeingAppRepository } from './homeSale-sightseeing.repository';

@Module({
  imports: [AuthAppModule, FileLocalModule],
  controllers: [HomeSaleAppController],
  providers: [HomeSaleIndexAppService, HomeSaleSightseeingAppService, HomeSaleIndexAppRepository, HomeSaleSightseeingAppRepository],
  exports: [],
})
export class HomeSaleAppModule {}
