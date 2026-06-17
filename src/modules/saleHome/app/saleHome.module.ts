import { Module } from '@nestjs/common';
import { AuthAppModule } from 'src/modules/auth/app/auth.module';
import { SaleHomeAppController } from './saleHome.controller';
import { SaleHomeAppRepository } from './saleHome.repository';
import { SaleHomeAppService } from './saleHome.service';
import { FileLocalModule } from 'src/common/fileLocal/fileLocal.module';

@Module({
  imports: [AuthAppModule, FileLocalModule],
  controllers: [SaleHomeAppController],
  providers: [SaleHomeAppService, SaleHomeAppRepository],
  exports: [SaleHomeAppService],
})
export class SaleHomeAppModule {}
