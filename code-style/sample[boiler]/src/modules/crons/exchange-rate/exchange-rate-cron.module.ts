import { Module } from '@nestjs/common';
import { ExchangeRateModule } from '../../exchange-rate/exchange-rate.module';
import { ExchangeRateCronService } from './exchange-rate-cron.service';

@Module({
  imports: [ExchangeRateModule],
  providers: [ExchangeRateCronService],
  exports: [ExchangeRateCronService],
})
export class ExchangeRateCronModule {}
