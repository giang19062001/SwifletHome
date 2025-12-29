import { Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule {}
