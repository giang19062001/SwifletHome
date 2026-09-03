import { Module } from '@nestjs/common';
import { MqttModule } from 'src/common/mqtt/mqtt.module';
import { AuthAppModule } from 'src/modules/auth/app/auth.module';
import { UserHomeIotController } from './userHome-iot.controller';
import { UserHomeIotRepository } from './userHome-iot.repository';
import { UserHomeIotService } from './userHome-iot.service';

@Module({
  imports: [AuthAppModule, MqttModule],
  controllers: [UserHomeIotController],
  providers: [UserHomeIotService, UserHomeIotRepository],
  exports: [UserHomeIotService, UserHomeIotRepository],
})
export class UserHomeIotModule {}
