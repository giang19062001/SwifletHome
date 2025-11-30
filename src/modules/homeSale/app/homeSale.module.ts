import { Module } from '@nestjs/common';
import { HomeSaleAppController } from './homeSale.controller';
import { HomeSaleAppRepository } from './homeSale.repository';
import { HomeSaleAppService } from './homeSale.service';
import { AuthAppModule } from 'src/modules/auth/app/auth.module';
import { FileLocalModule } from 'src/common/fileLocal/fileLocal.module';

@Module({
  imports: [AuthAppModule, FileLocalModule],
  controllers: [HomeSaleAppController],
  providers: [HomeSaleAppService, HomeSaleAppRepository],
  exports: [HomeSaleAppService],
})
export class HomeSaleAppModule {}
