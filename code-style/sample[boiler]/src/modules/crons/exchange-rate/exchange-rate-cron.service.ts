import { Inject, Injectable } from '@nestjs/common';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Cron, CronExpression } from '@nestjs/schedule';
import { configDotenv } from 'dotenv';
import { CRON_JOBS, ENVIRONMENTS } from '../../../common/constants/enums';
import { IExchangeRateService } from '../../exchange-rate/interface/exchange-rate.interface';

configDotenv();
@Injectable()
export class ExchangeRateCronService {
  constructor(
    @Inject(IExchangeRateService)
    private readonly exchangeRateService: IExchangeRateService,
  ) {}

  // @Cron(CronExpression.EVERY_10_HOURS, {
  //   name: CRON_JOBS.EXCHANGE_RATE,
  //   timeZone: 'Europe/Stockholm',
  //   waitForCompletion: true,
  // })
  async updateExchangeRates(id?: number) {
    if (process.env.NODE_ENV === ENVIRONMENTS.LOCAL) return;
    await this.exchangeRateService.updateExchangeRates(id);
  }
}
