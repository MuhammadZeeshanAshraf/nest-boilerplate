import { Inject, Injectable } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import axios from 'axios';
import { StorageConfig } from './common/config/storage.config';
import { PROJECT_NAME } from './common/constants';
import dataSource from './common/database/dbConfig';
import { IMagicBudgetService } from './modules/budget/interfaces/magic-budget.interface';
import { IEmailService } from './modules/email/interfaces/email.interface';
import { IExchangeRateService } from './modules/exchange-rate/interface/exchange-rate.interface';
import { IGcpBucketService } from './modules/gcp/services/interfaces/gcp-bucket.service.interface';
import { IYapilyService } from './modules/gocardless/interface/yapily.interface';
import { KafkaService } from './modules/kafka/kafka.service';
import { RedisService } from './modules/redis/redis.service';

@Injectable()
export class AppService {
  constructor(
    @Inject(IEmailService)
    private readonly emailService: IEmailService,
    private readonly kafkaService: KafkaService,
    private readonly redisService: RedisService,
    @Inject(IGcpBucketService)
    private readonly gcpBucketService: IGcpBucketService,
    @Inject(IExchangeRateService)
    private readonly exchangeRateService: IExchangeRateService,

    @Inject(IYapilyService)
    private readonly yapilyService: IYapilyService,

    @Inject(IMagicBudgetService)
    private readonly magicBudgetService: IMagicBudgetService,
  ) {}

  checkServer(): string {
    return `The ${PROJECT_NAME} Up and Running.`;
  }

  async checkServerHealth(): Promise<any> {

    // DB check
    const serviceResult = { server: `ok` };
    try {
      const pingDB = await dataSource.query(`SELECT 1 + 1 AS result`);
      if (pingDB[0].result !== 2) {
        serviceResult['database'] = `The DB is not healthy.`;
      } else {
        serviceResult['database'] = `ok`;
      }
    } catch (error) {
      serviceResult['database'] =
        `The DB is not healthy. ${JSON.stringify(error)}`;
    }

    // mail gun check
    try {
      const resp = await this.emailService.test();
      if (resp) serviceResult['email'] = `ok`;
      else serviceResult['email'] = `The email service is not healthy.`;
    } catch (error) {
      serviceResult['email'] =
        `The email service is not healthy. ${JSON.stringify(error)}`;
    }

    try {
      const resp = await this.kafkaService.produce('test', {});
      if (resp) serviceResult['kafka'] = `ok`;
      else serviceResult['kafka'] = `The kafka service is not healthy.`;
    } catch (error) {
      serviceResult['kafka'] =
        `The kafka service is not healthy. ${JSON.stringify(error)}`;
    }

    try {
      const resp = await this.redisService.set('test', 'test');
      if (resp) serviceResult['redis'] = `ok`;
      else serviceResult['redis'] = `The redis service is not healthy.`;
    } catch (error) {
      serviceResult['redis'] =
        `The redis service is not healthy. ${JSON.stringify(error)}`;
    }

    try {
      const mediaBckt = await this.gcpBucketService.uploadTest(
        StorageConfig.mediaBucket,
      );
      const categBckt = await this.gcpBucketService.uploadTest(
        StorageConfig.categorizationBucket,
      );

      if (!mediaBckt)
        serviceResult['gcp'] =
          `The gcp service is not healthy for media bucket.`;
      else if (!categBckt)
        serviceResult['gcp'] =
          `The gcp service is not healthy for categorization bucket.`;
      else serviceResult['gcp'] = `ok`;
    } catch (error) {
      console.log(error);
      serviceResult['gcp'] =
        `The gcp service is not healthy. ${JSON.stringify(error)}`;
    }
    try {
      const resp = await this.exchangeRateService.getExchangeRateByName(
        'EUR',
        'USD',
      );
      if (typeof resp !== 'number')
        serviceResult['exchangeRate'] =
          `The exchangeRate service is not healthy.`;
      else serviceResult['exchangeRate'] = { res: `ok`, data: resp };
    } catch (error) {
      serviceResult['exchangeRate'] =
        `The exchangeRate service is not healthy. ${JSON.stringify(error)}`;
    }

    try {
      const resp = Sentry.captureMessage('test');
      if (!resp) serviceResult['sentry'] = `The sentry service is not healthy.`;
      else serviceResult['sentry'] = `ok`;
    } catch (error) {
      serviceResult['sentry'] =
        `The sentry service is not healthy. ${JSON.stringify(error)}`;
    }

    try {
      const resp = await this.yapilyService.findAllInstitutionsForTest();
      if (!resp.length)
        serviceResult['yapily'] = `The yapily service is not healthy.`;
      else serviceResult['yapily'] = `ok`;
    } catch (error) {
      serviceResult['yapily'] =
        `The yapily service is not healthy. ${JSON.stringify(error)}`;
    }

    try {
      const resp = await axios.get(
        'https://bank-categorization.penningmeester.ai/server-status',
      );
      if (!resp)
        serviceResult['notification'] =
          `The notification service is not healthy.`;
      else serviceResult['notification'] = `ok`;
    } catch (error) {
      serviceResult['notification'] =
        `The notification service is not healthy. ${JSON.stringify(error)}`;
    }

    try {
      const resp = await this.magicBudgetService.ping();
      if (!resp)
        serviceResult['magicBudget'] =
          `The magicBudget service is not healthy.`;
      serviceResult['magicBudget'] = `ok`;
    } catch (error) {
      serviceResult['magicBudget'] =
        `The magicBudget service is not healthy. ${JSON.stringify(error)}`;
    }

    for (const key in serviceResult) {
      if (typeof serviceResult[key] === 'object') {
        if (serviceResult[key].res !== 'ok') {
          throw new Error(`Error: ${serviceResult[key].data}`);
        }
      } else if (serviceResult[key] !== 'ok') {
        throw new Error(`Error: ${serviceResult[key]}`);
      }
    }
    return serviceResult;
  }
}
