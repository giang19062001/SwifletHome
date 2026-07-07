import { Module } from '@nestjs/common';
import { AuthAppModule } from 'src/modules/auth/app/auth.module';
import { SaleHomeAppController } from './saleHome.controller';
import { SaleHomeAppRepository } from './saleHome.repository';
import { SaleHomeAppService } from './saleHome.service';
import { FileLocalModule } from 'src/common/fileLocal/fileLocal.module';
import { SaleHomeSightseeingAppController } from './saleHome-sightseeing.controller';
import { SaleHomeSightseeingAppService } from './saleHome-sightseeing.service';
import { SaleHomeSightseeingAppRepository } from './saleHome-sightseeing.repository';
import { OptionModule } from 'src/modules/options/option.module';
import { MailModule } from 'src/common/mail/mail.module';

@Module({
  imports: [AuthAppModule, FileLocalModule, OptionModule, MailModule],
  controllers: [SaleHomeAppController, SaleHomeSightseeingAppController],
  providers: [SaleHomeAppService, SaleHomeAppRepository, SaleHomeSightseeingAppService, SaleHomeSightseeingAppRepository],
  exports: [SaleHomeAppService],
})
export class SaleHomeAppModule {}
