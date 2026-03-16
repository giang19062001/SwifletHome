import { Module } from '@nestjs/common';
import { AuthAppModule } from 'src/modules/auth/app/auth.module';
import { ConsignmentAppController } from './consigment.controller';
import { ConsignmentAppRepository } from './consigment.repository';
import { ConsignmentAppService } from './consigment.service';

@Module({
  imports: [AuthAppModule],
  controllers: [ConsignmentAppController],
  providers: [ConsignmentAppService, ConsignmentAppRepository],
  exports: [],
})
export class ConsignmentAppModile {}
