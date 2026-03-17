import { Inject, Injectable } from '@nestjs/common';
import { configDotenv } from 'dotenv';
import { CRON_JOBS, ENVIRONMENTS } from '../../../common/constants/enums';
import { ITransactionService } from '../../transaction/interfaces/transaction.interface';

configDotenv();
@Injectable()
export class RemoveCategCronService {
  constructor(
    @Inject(ITransactionService)
    private readonly transactionService: ITransactionService,
  ) {}

  // @Cron('0 0 * * *', {
  //   timeZone: 'UTC',
    // name: CRON_JOBS.REMOVE_CATEG_TRANSACTIONS,
  //   waitForCompletion: true,
  // })
  async refills() {
    if (process.env.NODE_ENV === ENVIRONMENTS.LOCAL) return;
    await this.transactionService.removeUserClarificationTransactionsFromLast10Days();
  }
}
