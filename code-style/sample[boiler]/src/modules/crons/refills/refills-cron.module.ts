import { Module } from '@nestjs/common';
import { ExpenseModule } from '../../expense/expense.module';
import { GocardlessModule } from '../../gocardless/gocardless.module';
import { PartnerModule } from '../../partner/partner.module';
import { RedisModuleClass } from '../../redis/redis.module';
import { RefillsCronService } from './refills-cron.service';

@Module({
  imports: [ExpenseModule, GocardlessModule, RedisModuleClass, PartnerModule],
  providers: [RefillsCronService],
  exports: [RefillsCronService],
})
export class RefillsCronModule {}
