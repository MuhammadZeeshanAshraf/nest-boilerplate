import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { QUEUES } from '../../../common/constants';
import { BankAccountModule } from '../../bank-account/bank-account.module';
import { RefreshTransactionCronService } from './refresh-transaction-cron.service';

@Module({
  imports: [
    BankAccountModule,

    BullModule.registerQueue({
      name: QUEUES.REFRESH_TRANSACTIONS.NAME,
      defaultJobOptions: {
        delay: 5000,
        removeOnFail: false,
        removeOnComplete: true,
        backoff: {
          delay: 3600000,
          type: 'exponential',
        },

        attempts: 1,
      },
    }),
  ],
  providers: [RefreshTransactionCronService],
  exports: [RefreshTransactionCronService],
})
export class RefreshTransactionCronModule {}
