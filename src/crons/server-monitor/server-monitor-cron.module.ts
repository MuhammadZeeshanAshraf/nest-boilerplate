import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServerMonitorCronService } from './server-monitor-cron.service';
import { AppService } from 'src/app.service';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  providers: [ServerMonitorCronService],
})
export class ServerMonitorCronModule {}
