import { forwardRef, Module } from '@nestjs/common';
import { UserAppService } from './user.service';
import { UserAppRepository } from './user.repository';
import { UserAppController } from './user.controller';
import { AuthAppModule } from 'src/modules/auth/app/auth.module';

@Module({
  imports: [forwardRef(() => AuthAppModule)],
  controllers: [UserAppController],
  providers: [UserAppService, UserAppRepository],
  exports: [UserAppService, UserAppRepository],
})
export class UserAppModule {}
