import { Module } from '@nestjs/common';
import { UserHomeAppController } from './userHome.controller';
import { UserHomeAppService } from './userHome.service';
import { UserHomeAppRepository } from './userHome.repository';
import { AuthAppModule } from 'src/modules/auth/app/auth.module';

@Module({
  imports: [AuthAppModule],
  controllers: [UserHomeAppController],
  providers: [UserHomeAppService, UserHomeAppRepository],
  exports: []
})
export class UserHomeModule {}