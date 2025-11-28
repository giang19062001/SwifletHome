import { forwardRef, Module } from '@nestjs/common';
import { AuthAdminController } from './auth.controller';
import { AuthAdminService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserAdminModule } from 'src/modules/user/admin/user.module';

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
    forwardRef(() => UserAdminModule), // ← phá phụ thuộc vòng tròn
  ],
  controllers: [AuthAdminController],
  providers: [AuthAdminService],
  exports: [AuthAdminService],
})
export class AuthAdminModule {}
