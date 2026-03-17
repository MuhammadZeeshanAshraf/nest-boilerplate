import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { configDotenv } from 'dotenv';
import moment from 'moment';
import { BudgetRefillDay, REDIS_PATTERNS } from '../../../common/constants';
import {
  CRON_JOBS,
  ENVIRONMENTS,
  INCOME_FREQUENCY,
  TRANSACTION_ENTRY_METHODS,
} from '../../../common/constants/enums';
import { ColoredLogger } from '../../../common/logger/logger.service';
import { UtilsService } from '../../../common/utils/UtilsService';
import { Expense } from '../../expense/entities/expense.entity';
import { RefillReference } from '../../expense/entities/refill-reference.entity';
import { IExpenseService } from '../../expense/interfaces/expense.interface';
import { CreateManualTransactionTransferPotDto } from '../../gocardless/dto/transactions/create-manual-transaction-transfer-pot.dto';
import { IBankingService } from '../../gocardless/interface/banking.interface';
import { IPartnerService } from '../../partner/interfaces/partner.interface';
import { RedisService } from '../../redis/redis.service';

configDotenv();
@Injectable()
export class RefillsCronService {
  constructor(
    @Inject(IExpenseService)
    private readonly expenseService: IExpenseService,
    @Inject(IBankingService)
    private readonly bankingService: IBankingService,
    @Inject(IPartnerService)
    private readonly partnerService: IPartnerService,
    private readonly logger: ColoredLogger,
    private readonly redisService: RedisService,
    private readonly utilService: UtilsService,
  ) {}

  // @Cron('0 0 * * *', {
  //   timeZone: 'UTC',
  //   name: CRON_JOBS.REFILLS,
  //   waitForCompletion: true,
  // })
  // @Cron(CronExpression.EVERY_MINUTE, {
  //   timeZone: 'UTC',
  //   name: CRON_JOBS.REFILLS,
  //   waitForCompletion: true,
  // })
  async refills(userId?: number) {
    if (process.env.NODE_ENV === ENVIRONMENTS.LOCAL) return;
    const take = 100;
    let currentCount = 0;
    const refillExpenseIdsSet = new Set(
      await this.expenseService.getAllExpenseRefills(userId),
    );
    const allRefillExpenseIds = Array.from(refillExpenseIdsSet);
    for (let i = 0; i <= Number.MAX_SAFE_INTEGER; i++) {
      // eslint-disable-next-line no-await-in-loop
      const refillExpenseIds = allRefillExpenseIds.slice(
        i * take,
        (i + 1) * take,
      );
      if (refillExpenseIds.length === 0) break;
      const refillExpenses =
        await this.expenseService.getExpenseRefills(refillExpenseIds);
      if (refillExpenses.length === 0) continue;
      if (refillExpenses.length) {
        this.logger.info(`Refilling ${refillExpenses.length} expenses`);
        // eslint-disable-next-line no-await-in-loop
        const refillReferences = await this.expenseService.getRefillReferences(
          refillExpenses.map((expense) => expense.id),
        );
        const lockedRefills = [];
        for (const exp of refillExpenses) {
          const lock = await this.redisService.get(`refill_lock_${exp.id}`);
          if (!lock) lockedRefills.push(exp);
        }
        // eslint-disable-next-line no-await-in-loop
        await this.handleRefillExpenses(lockedRefills, refillReferences);
        for (const fill of refillExpenses) {
          await this.redisService.set(`refill_lock_${fill.id}`, 'true', 900);
        }
      }
      currentCount++;
      if (currentCount === 5) {
        // eslint-disable-next-line no-await-in-loop
        await this.sleep(10000);
        currentCount = 0;
      }
    }
  }

  private sleep(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  private adjustedAmountForRefillFrequency(
    refillFrequency: INCOME_FREQUENCY,
    refillAmount: number,
    budgetStart: typeof BudgetRefillDay | string,
  ) {
    if (!refillAmount || refillAmount <= 0 || !refillFrequency) return 0;

    const today = moment.utc();

    const getTargetDateInMonth = (
      referenceDate: moment.Moment,
    ): moment.Moment => {
      switch (budgetStart) {
        case 'first_day_of_month':
          return referenceDate.clone().startOf('month').utc();
        case 'last_day_of_month':
          return referenceDate.clone().endOf('month').utc();
        case 'penultimate':
          return referenceDate.clone().endOf('month').subtract(1, 'day').utc();
        default: {
          const dayOfMonth = parseInt(budgetStart as string, 10);
          if (Number.isNaN(dayOfMonth)) return referenceDate.clone();
          const daysInMonth = referenceDate.daysInMonth();
          const targetDay = Math.min(dayOfMonth, daysInMonth);
          return referenceDate.clone().date(targetDay).utc();
        }
      }
    };
    const isCalendarQuarterMonth = (m: moment.Moment) => {
      const mm = m.month(); // 0..11
      return mm === 0 || mm === 3 || mm === 6 || mm === 9;
    };

    const isSameDay = (a: moment.Moment, b: moment.Moment) =>
      a.clone().utc().startOf('day').valueOf() ===
      b.clone().utc().startOf('day').valueOf();

    const shouldRefillBasedOnInterval = (): boolean => {
      switch (refillFrequency) {
        case INCOME_FREQUENCY.WEEKLY:
          return today.isoWeekday() === 1;

        case INCOME_FREQUENCY.MONTHLY:
          return isSameDay(today, getTargetDateInMonth(today.clone()));

        case INCOME_FREQUENCY.QUARTERLY:
          if (!isCalendarQuarterMonth(today)) return false;
          return isSameDay(today, getTargetDateInMonth(today.clone()));

        case INCOME_FREQUENCY.YEARLY:
          if (today.month() !== 0) return false;
          return isSameDay(today, getTargetDateInMonth(today.clone()));

        case INCOME_FREQUENCY.MINUTELY:
          return true;

        default:
          return false;
      }
    };

    return shouldRefillBasedOnInterval() ? refillAmount : 0;
  }

  async handleRefillExpenses(
    refillExpenses: Expense[],
    refillReferences: RefillReference[],
  ) {
    const transactionCreates: Array<CreateManualTransactionTransferPotDto> = [];

    refillExpenses.forEach((expense) => {
      const todayDateSimple = moment.utc().format('YYYY-MM-DD');
      const referenceIfAny = refillReferences.find(
        (ref) => ref.expenseId === expense.id && ref.date === todayDateSimple,
      );
      if (referenceIfAny && referenceIfAny.isDeleted) return;
      const { refillAmount, refillFrequency, budget } = expense;
      const adjustedAmount = this.adjustedAmountForRefillFrequency(
        refillFrequency || (expense.isGoal ? null : INCOME_FREQUENCY.MONTHLY),
        Number(
          referenceIfAny?.amount ??
            refillAmount ??
            this.utilService.calculateExpenseRefillOccurrenceAmount(
              expense,
              expense.currencyId,
              expense.currencyId,
              new Map(),
            ),
        ),
        budget.refillDay,
      );
      if (!adjustedAmount || adjustedAmount <= 0) return;
      const newTransaction = this.transactionCreate(
        this.utilService.roundToTwo(adjustedAmount),
        expense,
      );
      transactionCreates.push(newTransaction);
    });

    if (transactionCreates.length > 0) {
      const userIds = new Set(transactionCreates.map((t) => t.userId));
      const partners = await this.partnerService.getPartnersByUserIds([
        ...userIds,
      ]);
      const patterns = [
        REDIS_PATTERNS.QUICK_BUDGET_BY_ID,
        REDIS_PATTERNS.QUICK_BUDGET_COMBINED,
        REDIS_PATTERNS.OVERVIEW_BUDGET_BY_ID,
        REDIS_PATTERNS.OVERVIEW_BUDGET_COMBINED,
      ];
      const userIdsWithPartnerIds = new Set([
        ...userIds,
        ...partners.flatMap((p) => p.partnerIds),
      ]);
      await Promise.all(
        [...userIdsWithPartnerIds].map((userId) =>
          this.redisService.delByPatternFromService(patterns, userId),
        ),
      );
    }
    this.logger.debug('handleRefillExpenses', transactionCreates);
    await this.bankingService.createRefillTransaction(
      transactionCreates,
      refillExpenses,
    );
  }

  private transactionCreate(amount: number, expense: Expense) {
    const newTransaction = new CreateManualTransactionTransferPotDto();
    newTransaction.transactionAmount = {
      amount: amount.toString(),
      currency: expense.currency.code,
    };
    newTransaction.userId = expense.userId;
    newTransaction.bookingDate = moment.utc().toDate();
    newTransaction.fromBudgetId = expense.budgetId;
    newTransaction.toBudgetId = expense.budgetId;
    newTransaction.recurringDays = null;
    newTransaction.frequency = null;
    newTransaction.currencyId = expense.currency.id;
    newTransaction.reason = 'Refill';
    newTransaction.fromExpenseId = null;
    newTransaction.toExpenseId = expense.id;
    newTransaction.refillExpenseId = expense.id;
    newTransaction.entryMethod = TRANSACTION_ENTRY_METHODS.MANUAL;
    newTransaction.unAllocatedFrom = true;
    newTransaction.unAllocatedTo = false;
    newTransaction.paymentPotFrom = false;
    newTransaction.paymentPotTo = false;
    newTransaction.recurringEndMethod = null;
    newTransaction.recurringEndValue = null;
    return newTransaction;
  }
}
