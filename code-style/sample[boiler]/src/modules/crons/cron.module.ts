import { Module } from '@nestjs/common';
import { CronController } from './cron.controller';
import { ExchangeRateCronModule } from './exchange-rate/exchange-rate-cron.module';
import { RefillsCronModule } from './refills/refills-cron.module';
import { RefreshTransactionCronModule } from './refresh-transactions/refresh-transaction-cron.module';
import { RemoveCategCronModule } from './remove-categ-tx/remove-categ-cron.module';

@Module({
  imports: [
    ExchangeRateCronModule,
    RefillsCronModule,
    RefreshTransactionCronModule,
    RemoveCategCronModule,
  ],
  controllers: [CronController],
})
export class CronModule {}
