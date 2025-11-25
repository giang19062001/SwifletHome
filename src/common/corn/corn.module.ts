import { Module } from '@nestjs/common';
import { FileLocalModule } from '../fileLocal/fileLocal.module';
import { CornService } from './corn.service';
import { ScheduleModule } from '@nestjs/schedule';
import { DoctorAppModule } from 'src/modules/doctor/app/doctor.module';
import { UserHomeAppModule } from 'src/modules/userHome/app/userHome.module';

@Module({
  imports: [ScheduleModule.forRoot(), FileLocalModule, DoctorAppModule, UserHomeAppModule],
  controllers: [],
  providers: [CornService],
  exports: [],
})
export class CornModule {}
