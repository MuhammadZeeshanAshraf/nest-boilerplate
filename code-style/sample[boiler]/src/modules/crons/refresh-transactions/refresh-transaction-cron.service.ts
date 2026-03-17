import { InjectQueue } from '@nestjs/bull';
import { Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Queue } from 'bull';
import { configDotenv } from 'dotenv';
import { QUEUES } from '../../../common/constants';
import { CRON_JOBS, ENVIRONMENTS } from '../../../common/constants/enums';
import { ColoredLogger } from '../../../common/logger/logger.service';
import { BankAccount } from '../../bank-account/entities/bank-account.entity';
import { IBankAccountService } from '../../bank-account/interfaces/bank-account.interface';

configDotenv();
@Injectable()
export class RefreshTransactionCronService {
  constructor(
    @Inject(IBankAccountService)
    private readonly bankAccountService: IBankAccountService,
    @InjectQueue(QUEUES.REFRESH_TRANSACTIONS.NAME)
    private readonly refreshQueue: Queue,
    private readonly logger: ColoredLogger,
  ) {}

  // @Cron('0 0,6,13,20 * * *', {
  //   name: CRON_JOBS.REFRESH_TRANSACTIONS,
  //   timeZone: 'Europe/Stockholm',
  //   waitForCompletion: true,
  // })
  async refresh(bankId?: number) {
    if (process.env.NODE_ENV === ENVIRONMENTS.LOCAL) return;
    const bankAccounts = await this.bankAccountService.findForCrons(bankId);
    if (bankAccounts.length) {
      this.logger.info(`Refilling ${bankAccounts.length} banks`);
      await this.handleRefreshBankAccounts(bankAccounts);
    }
  }

  async handleRefreshBankAccounts(bankAccounts: BankAccount[]) {
    bankAccounts = bankAccounts.filter(
      (b) => b.budget && b.budget.deletedAt == null,
    );
    const existingJobs = await this.refreshQueue.getJobs([
      'active',
      'delayed',
      'waiting',
    ]);
    const existingBankIds = new Set(
      existingJobs.map((j) => Number(j?.id?.toString()) || 0),
    );
    const newBankIds = bankAccounts
      .map((b) => b.id)
      .filter((id) => !existingBankIds.has(id));
    await this.refreshQueue.addBulk(
      bankAccounts
        .filter((b) => newBankIds.includes(b.id))
        .map((b) => ({
          jobId: b.id.toString(),
          data: { bankId: b.id },
          name: QUEUES.REFRESH_TRANSACTIONS.PROCESSOR,
        })),
    );
  }
}
