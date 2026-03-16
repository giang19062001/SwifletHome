import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MqttService } from './mqtt.service';

@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule {}
