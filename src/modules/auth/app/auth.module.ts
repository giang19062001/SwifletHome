import { forwardRef, Module } from '@nestjs/common';
import { AuthAppController } from './auth.controller';
import { AuthAppService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OtpAppModule } from 'src/modules/otp/otp.module';
import { UserAppModule } from 'src/modules/user/app/user.module';
import { AUTH_CONFIG } from '../auth.config';
import { PhoneCodeModule } from 'src/modules/phoneCode/phoneCode.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_KEY'),
        // signOptions: { expiresIn: AUTH_CONFIG.EXPIRED_APP_SAVE },
      }),
    }),
    OtpAppModule,
    forwardRef(() => UserAppModule),
    PhoneCodeModule,
  ],
  controllers: [AuthAppController],
  providers: [AuthAppService],
  exports: [AuthAppService],
})
export class AuthAppModule {}
