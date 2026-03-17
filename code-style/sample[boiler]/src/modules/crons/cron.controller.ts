import { Controller, Get, Inject } from '@nestjs/common';
import { RefreshTransactionCronService } from './refresh-transactions/refresh-transaction-cron.service';

@Controller('cron')
export class CronController {
  constructor(
    @Inject(RefreshTransactionCronService)
    private readonly refreshTransactionCronService: RefreshTransactionCronService,
  ) {}

  @Get('refresh-transactions')
  refreshTransactions() {
    return this.refreshTransactionCronService.refresh();
  }
}
