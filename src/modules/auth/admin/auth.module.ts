import { Module } from '@nestjs/common';
import { AuthAdminController } from './auth.controller';
import { AuthAdminService } from './auth.service';
import { AuthAdminRepository } from './auth.repository';
import { JwtModule } from '@nestjs/jwt';
import { PageAuthAdminGuard } from './auth.page.guard';
import { ApiAuthAdminGuard } from './auth.api.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_KEY'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [AuthAdminController],
  providers: [AuthAdminService, AuthAdminRepository, PageAuthAdminGuard, ApiAuthAdminGuard],
  exports: [AuthAdminService, PageAuthAdminGuard, ApiAuthAdminGuard],
})
export class AuthAdminModule {}
