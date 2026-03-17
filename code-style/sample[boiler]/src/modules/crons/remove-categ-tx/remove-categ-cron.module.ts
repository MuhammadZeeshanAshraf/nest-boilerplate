import { Module } from '@nestjs/common';
import { TransactionModule } from '../../transaction/transaction.module';
import { RemoveCategCronService } from './remove-categ-cron.service';

@Module({
  imports: [TransactionModule],
  providers: [RemoveCategCronService],
  exports: [RemoveCategCronService],
})
export class RemoveCategCronModule {}
