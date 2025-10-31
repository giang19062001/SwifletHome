import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { HomeSubmitAppRepository } from './homeSubmit.repository';
import { HomeSubmitAppService } from './homeSubmit.service';
import { HomeSubmitAppController } from './homeSubmit.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [HomeSubmitAppController],
  providers: [HomeSubmitAppService, HomeSubmitAppRepository],
})
export class HomeSubmitAppModule {}
