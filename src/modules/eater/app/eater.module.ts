import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { EaterAppController } from './eater.controller';
import { EaterAppService } from './eater.service';
import { EaterAppRepository } from './eater.repository';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_KEY'),
      }),
    }),
  ],
  controllers: [EaterAppController],
  providers: [EaterAppService, EaterAppRepository],
  exports: [EaterAppService],
})
export class EaterAppModule {}
