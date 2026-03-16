import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserAdminModule } from 'src/modules/user/admin/user.module';
import { AUTH_CONFIG } from '../auth.config';
import { AuthAdminController } from './auth.controller';
import { AuthAdminService } from './auth.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_KEY'),
        signOptions: { expiresIn: AUTH_CONFIG.EXPIRED_ADMIN},
      }),
    }),
    forwardRef(() => UserAdminModule), // ← phá phụ thuộc vòng tròn
  ],
  controllers: [AuthAdminController],
  providers: [AuthAdminService],
  exports: [AuthAdminService],
})
export class AuthAdminModule {}
