import { Module } from '@nestjs/common';
import { AuthAppController } from './auth.controller';
import { AuthAppService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OtpAppModule } from 'src/modules/otp/otp.module';
import { UserAppModule } from 'src/modules/user/app/user.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_KEY'),
        // signOptions: { expiresIn: '24h' },
        signOptions: { expiresIn: '20s' },
      }),
    }),
    OtpAppModule,
    UserAppModule,
  ],
  controllers: [AuthAppController],
  providers: [AuthAppService],
  exports: [AuthAppService],
})
export class AuthAppModule {}
