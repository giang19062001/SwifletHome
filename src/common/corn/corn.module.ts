import { Module } from '@nestjs/common';
import { FileLocalModule } from '../fileLocal/fileLocal.module';
import { CornService } from './corn.service';
import { ScheduleModule } from '@nestjs/schedule';
import { DoctorAppModule } from 'src/modules/doctor/app/doctor.module';
import { UserHomeAppModule } from 'src/modules/userHome/app/userHome.module';
import { TodoAppModule } from 'src/modules/todo/app/todo.module';
import { UserAppModule } from 'src/modules/user/app/user.module';
import { QrAppModule } from 'src/modules/qr/app/qr.module';
import { TeamAppModule } from 'src/modules/team/app/team.module';

@Module({
  imports: [ScheduleModule.forRoot(), UserAppModule, FileLocalModule, DoctorAppModule, TodoAppModule, UserHomeAppModule, QrAppModule, TeamAppModule],
  controllers: [],
  providers: [CornService],
  exports: [],
})
export class CornModule {}
