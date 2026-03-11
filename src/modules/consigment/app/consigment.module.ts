import { Module } from '@nestjs/common';
import { AuthAppModule } from 'src/modules/auth/app/auth.module';
import { ConsignmentAppController } from './consigment.controller';
import { ConsignmentAppService } from './consigment.service';
import { ConsignmentAppRepository } from './consigment.repository';

@Module({
  imports: [AuthAppModule],
  controllers: [ConsignmentAppController],
  providers: [ConsignmentAppService, ConsignmentAppRepository],
  exports: [],
})
export class ConsignmentAppModile {}
