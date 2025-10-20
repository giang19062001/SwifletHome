import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { DatabaseModule } from '../database/database.module';
import { JwtModule } from '@nestjs/jwt';
import { PageAuthGuard } from './auth.page.guard';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({
      secret: 'jwt-swiftlet-key',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, PageAuthGuard],
  exports: [AuthService, PageAuthGuard],
})
export class AuthModule {}
