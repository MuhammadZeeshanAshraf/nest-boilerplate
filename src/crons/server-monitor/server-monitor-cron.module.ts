import { Module } from '@nestjs/common';
import { ServerMonitorCronService } from './server-monitor-cron.service';

@Module({
  providers: [ServerMonitorCronService],
})
export class ServerMonitorCronModule {}
