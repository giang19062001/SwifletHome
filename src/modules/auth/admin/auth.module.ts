import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { JwtModule } from '@nestjs/jwt';
import { PageAuthGuard } from './auth.page.guard';
import { ApiAuthGuard } from './auth.api.guard';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({
      secret: 'jwt-swiftlet-key',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, PageAuthGuard, ApiAuthGuard],
  exports: [AuthService, PageAuthGuard, ApiAuthGuard],
})
export class AuthModule {}
