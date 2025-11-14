import { Module } from '@nestjs/common';
import { HomeAppController } from './home.controller';
import { HomeAppRepository } from './home.repository';
import { HomeAppService } from './home.service';
import { AuthAppModule } from 'src/modules/auth/app/auth.module';

@Module({
  imports: [AuthAppModule],
  controllers: [HomeAppController],
  providers: [HomeAppService, HomeAppRepository],
  exports: [HomeAppService],
})
export class HomeAppModule {}
