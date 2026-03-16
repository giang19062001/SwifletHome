import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { OtpAppModule } from 'src/modules/otp/otp.module';
import { PhoneCodeModule } from 'src/modules/phoneCode/phoneCode.module';
import { UserAppModule } from 'src/modules/user/app/user.module';
import { AuthAppController } from './auth.controller';
import { AuthAppService } from './auth.service';

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
