import { Module } from '@nestjs/common';
import { GuestController } from './guest.controller';
import { GuestService } from './guest.service';
import { GuestRepository } from './guest.repository';

@Module({
  controllers: [GuestController],
  providers: [GuestService, GuestRepository],
  exports: [GuestService, GuestRepository],
})
export class GuestModule {}
