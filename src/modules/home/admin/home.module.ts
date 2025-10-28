import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { AuthModule } from 'src/modules/auth/admin/auth.module';
import { HomeController } from './home.controller';
import { HomeRepository } from './home.repository';
import { HomeService } from './home.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [HomeController],
  providers: [HomeService, HomeRepository],
})
export class HomeModule {}
