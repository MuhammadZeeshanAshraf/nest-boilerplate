import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CRON_JOB_NAME } from '../../common/constants';

@Injectable()
export class ServerMonitorCronService {
  private readonly logger = new Logger(ServerMonitorCronService.name);

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: CRON_JOB_NAME.CHECK_SERVER_HEALTH,
  })
  checkServerHealth() {
    const start = Date.now();
    this.logger.log('Starting server-health check.');
    const elapsed = Date.now() - start;
    this.logger.log(`Server-health check completed in ${elapsed}ms.`);
  }
}
