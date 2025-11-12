import { Module } from "@nestjs/common";
import { AuthAppController } from "./auth.controller";
import { AuthAppRepository } from "./auth.repository";
import { AuthAppService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { OtpAppModule } from "src/modules/otp/otp.module";

@Module({
  imports: [
     JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_KEY'),
        signOptions: { expiresIn: '24h' },
      }),
    }),
    OtpAppModule
  ],
  controllers: [AuthAppController],
  providers: [AuthAppService, AuthAppRepository],
  exports: [AuthAppService],
})
export class AuthAppModule {}
