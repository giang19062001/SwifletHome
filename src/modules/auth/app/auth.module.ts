import { Module } from '@nestjs/common';
import { AuthAppController } from './auth.controller';
import { AuthAppService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OtpAppModule } from 'src/modules/otp/otp.module';
import { UserAppModule } from 'src/modules/user/app/user.module';
import { FirebaseModule } from 'src/common/firebase/firebase.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_KEY'),
        signOptions: { expiresIn: '365d' },
      }),
    }),
    OtpAppModule,
    UserAppModule,
    FirebaseModule
  ],
  controllers: [AuthAppController],
  providers: [AuthAppService],
  exports: [AuthAppService],
})
export class AuthAppModule {}
