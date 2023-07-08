import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CRON_JOB_NAME } from 'src/common/constants';

@Injectable()
export class ServerMonitorCronService {
  constructor() {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: CRON_JOB_NAME.CHECK_SERVER_HEALTH,
  })
  checkServerHealth() {
    console.log('Starting Check Server Health Cron Job.');
    const start = Date.now();
    const end = Date.now();
    const executionTime = end - start;
    console.log(`Execution time: ${executionTime} ms`);
  }
}
