import { Module } from '@nestjs/common';
import { UserHomeAppController } from './userHome.controller';
import { UserHomeAppService } from './userHome.service';
import { UserHomeAppRepository } from './userHome.repository';
import { AuthAppModule } from 'src/modules/auth/app/auth.module';
import { FileLocalModule } from 'src/common/fileLocal/fileLocal.module';
import { UserAppModule } from 'src/modules/user/app/user.module';

@Module({
  imports: [AuthAppModule, FileLocalModule, UserAppModule],
  controllers: [UserHomeAppController],
  providers: [UserHomeAppService, UserHomeAppRepository],
  exports: [UserHomeAppRepository],
})
export class UserHomeAppModule {}
