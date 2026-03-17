/* eslint-disable prefer-destructuring */
import { forMember, mapFrom } from '@automapper/core';
import { BadRequestException, Injectable } from '@nestjs/common';
import { compare, genSalt, hash } from 'bcryptjs';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { parse } from 'csv-parse';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import * as fs from 'fs';
import moment from 'moment';
import path from 'path';
import { finished } from 'stream/promises';
import { v4 } from 'uuid';
import { BankBalance } from '../../modules/bank-account/entities/bank-account-balance.entity';
import { BankAccount } from '../../modules/bank-account/entities/bank-account.entity';
import { Budget } from '../../modules/budget/entities/budget.entity';
import { ScheduledTransactionDto } from '../../modules/dashboard/dto/scheduled-transactions.dto';
import { Expense } from '../../modules/expense/entities/expense.entity';
import { UserOccupationMetadata } from '../../modules/gocardless/types';
import { CreateTransactionDto } from '../../modules/transaction/dto/transaction/request/create-transaction.dto';
import { ScheduledTransactions } from '../../modules/transaction/dto/transaction/response/scheduled-transaction.dto';
import { Transaction } from '../../modules/transaction/entities/transaction.entity';
import { RecurrenceChanges } from '../../modules/transaction/types';
import { IncomeTransaction } from '../../modules/user/entities/income/income-transaction.entity';
import {
  AVG_DAYS_IN_YEAR,
  BudgetRefillDay,
  DAYS_IN_WEEK,
  MONTHS_IN_QUARTER,
  QUARTERS_IN_YEAR,
  WEEKS_IN_MONTH,
  WEEKS_IN_YEAR,
} from '../constants';
import {
  BUDGET_TYPES,
  INCOME_FREQUENCY,
  RECURRING_END_METHOD,
} from '../constants/enums';
import { ColoredLogger } from '../logger/logger.service';
import { AnyRecord, StringToAnyMap } from '../types/common-types';
import {
  Point,
  ProcessCSVFilesSettings,
  RangeKey,
  RecurringMarksCreditorMap,
} from './types';

dotenv.config();
@Injectable()
export class UtilsService {
  constructor(private readonly logger: ColoredLogger) {}

  getLastThreeMonths() {
    return moment().utc().subtract(3, 'month').format('YYYY-MM-DD');
  }

  encrypt(text: string): string {
    const serverKey = process.env.SERVER_KEY;
    const serverIv = process.env.SERVER_IV;
    const cipher = createCipheriv('aes-256-cbc', serverKey, serverIv);
    let encryptedPayload = cipher.update(text, 'utf8', 'hex');
    encryptedPayload += cipher.final('hex');
    const randomString = randomBytes(3).toString('hex');
    return `${encryptedPayload}${randomString}`;
  }

  decrypt(encryptedText: string): string {
    try {
      const serverKey = process.env.SERVER_KEY;
      const serverIv = process.env.SERVER_IV;
      const decipher = createDecipheriv('aes-256-cbc', serverKey, serverIv);
      const actualEncryptedText = encryptedText.slice(0, -6);

      const decryptedText = Buffer.concat([
        decipher.update(Buffer.from(actualEncryptedText, 'hex')),
        decipher.final(),
      ]);
      return decryptedText.toString('utf8');
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException('Decrypt failed');
    }
  }

  async hash(data: string): Promise<string> {
    const salt = await genSalt();
    return hash(data, salt);
  }

  async compare(data: string, encrypted: string): Promise<boolean> {
    return compare(data, encrypted);
  }

  async generateOTP(len: number): Promise<string> {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < len; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
  }

  getClientIp(req: Request) {
    const headers = [
      'x-client-ip',
      'x-forwarded-for',
      'cf-connecting-ip',
      'fastly-client-ip',
      'x-real-ip',
      'x-cluster-client-ip',
      'x-appengine-user-ip',
    ];

    // Check each header

    for (const header of headers) {
      const ip = req.headers[header];
      if (ip) {
        return Array.isArray(ip)
          ? ip[0].split(',')[0].trim()
          : ip.split(',')[0].trim();
      }
    }

    return req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  }

  async redisAvailabilityCheck(client: any): Promise<boolean> {
    let count = 0;
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (client.status === 'ready') {
          clearInterval(interval);
          resolve(true);
        }
        count++;
        if (count === 5) {
          clearInterval(interval);
          reject(new Error('Redis not available'));
        }
      }, 2000);
    });
  }

  convertSnakeToCamelCase(key: string) {
    return key
      .split('_')
      .map((v, i) => (i === 0 ? v : v.charAt(0).toUpperCase() + v.slice(1)))
      .join('');
  }

  getOneDayAgo(): Date {
    return moment.utc().subtract(1, 'day').toDate();
  }

  getFiveDaysAgo(): Date {
    return moment.utc().subtract(5, 'days').toDate();
  }

  getOneMonthAgo(): Date {
    return moment.utc().subtract(1, 'month').toDate();
  }

  getOneYearAgo(): Date {
    return moment.utc().subtract(1, 'year').toDate();
  }

  getFiveYearsAgo(): Date {
    return moment.utc().subtract(5, 'years').toDate();
  }

  removeDuplicatesFromArrayOfObjects(keys: string[], data: Record<any, any>[]) {
    const originalLength = data.length;
    const dataSet = new Set<string>();
    const result = data.filter((d) => {
      const keysObject: AnyRecord = {};
      keys.forEach((key) => {
        keysObject[key] = d[key];
      });
      const stringObj = JSON.stringify(keysObject);
      if (!dataSet.has(stringObj)) {
        dataSet.add(stringObj);
        return true;
      }
      return false;
    });

    const duplicatesRemoved = originalLength - result.length;
    if (duplicatesRemoved > 0) {
      this.logger.info(
        `[DUPLICATE_REMOVAL] Removed ${duplicatesRemoved} duplicate objects based on keys: ${keys.join(', ')}`,
      );
    }

    return result;
  }

  createSlug(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-');
  }

  sanitizeFilename(filename: string): string {
    // Remove special characters and replace spaces with hyphens
    return filename
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '-') // Replace any non-alphanumeric characters (except . and -) with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with a single hyphen
      .replace(/^-|-$/g, ''); // Remove leading and trailing hyphens
  }

  async processCSVFile<T>(
    file: Express.Multer.File,
    settings: ProcessCSVFilesSettings,
  ) {
    const content = file.buffer.toString('utf8');
const firstLine = content.split(/\r?\n/)[0];

const commaCount = (firstLine.match(/,/g) || []).length;
const semicolonCount = (firstLine.match(/;/g) || []).length;

const delimiter = semicolonCount > commaCount ? ';' : ',';
    let streamError= null;
    const parser = parse(file.buffer, {
      columns: true,
      skip_empty_lines: true,
      delimiter,
    });
    const {
      validatorColumns,
      rowStart,
      arbitraryReg,
      arbitraryReplacementReg,
      arbitraryVal,
      impReg,
      dto,
    } = settings;
    const dtoMap: StringToAnyMap = new Map();
    for (const [key, val] of Object.entries(dto)) {
      dtoMap.set(key, val);
    }
    let row = rowStart;
    const records: T[] = [];
    parser.on('data', (chunk) => {
      try{
      const columnsFromCSV = new Set(
        Object.keys(chunk).map((key) => key?.trim()),
      );
      const record = {} as unknown as T;
      validatorColumns.forEach((col) => {
        if (impReg.test(col)) {
          const columnName = col.slice(0, -1);
          const isArbitrary = arbitraryReg.test(columnName);
          if (!columnsFromCSV.has(columnName) && !isArbitrary) {
            streamError = `Column ${columnName} is missing at row ${row}`;
            throw new BadRequestException(streamError);
          } else if (!columnsFromCSV.has(columnName) && isArbitrary) {
            const baseName = columnName.replace(
              arbitraryReplacementReg,
              arbitraryVal,
            );
            const hasMatchingColumn = Array.from(columnsFromCSV).some(
              (csvCol) => {
                const csvBaseName = csvCol.replace(
                  arbitraryReplacementReg,
                  arbitraryVal,
                );
                return csvBaseName === baseName;
              },
            );
            if (!hasMatchingColumn) {
              streamError = `Column ${columnName} is missing at row ${row}`;
              throw new BadRequestException(
                streamError
              );
            }
          } else {
            const columnValue = chunk[columnName];
            if (!columnName || columnValue === '') {
              streamError = `Column ${columnName} value is required at row ${row}`;
              throw new BadRequestException(
                streamError
              );
            }
          }
        }
      });
      dtoMap.forEach((from, to) => {
        if (typeof from === 'object') {
          if (from.value) {
            let value = '';
            let arbitraryValue = '';
            const baseName = from.value.replace(
              arbitraryReplacementReg,
              arbitraryVal,
            );
            Object.entries(chunk).forEach(([key, csvValue]) => {
              const csvBaseName = key.replace(
                arbitraryReplacementReg,
                arbitraryVal,
              );
              if (csvBaseName === baseName) {
                value = csvValue as any;
                arbitraryValue = key.match(arbitraryReplacementReg)[1];
              }
              record[to] = {
                value: value?.trim(),
                arbitraryValue: arbitraryValue?.trim(),
              };
            });
          }
        } else {
          let fr = from;
          if (impReg.test(from)) {
            fr = from.slice(0, -1);
          }

          record[to] = chunk[fr]?.trim();
        }
      });
      records.push(record);
      row++;
    }catch (err) {
  streamError = err;
  parser.destroy(err);
}});
    parser.on('end', () => {
      this.logger.info('CSV parse complete');
    });
 try {
  await finished(parser);
} catch (_) {}
if(streamError){
  throw streamError;
}
    return records;
  }

  convertTransactionToPythonDto(
    txs: Transaction[],
    count: number,
    userMetadata: UserOccupationMetadata,
    accounts: BankAccount[],
    budgets: Budget[],
    publishToSyncingTopic: boolean = false,
  ) {
    const budgetMap = new Map(budgets.map((b) => [b.id, b]));
    return txs.map((tx) => {
      const budget = budgetMap.get(tx.budgetId);
      Object.keys(tx).forEach((key) => {
        if (tx[key] instanceof Date) {
          tx[key] = tx[key].toISOString().split('T')[0];
        }
      });
      const tomorrowStr = new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      const bookingDateForSend = tx.bookingDate
        ? tx.bookingDate
        : (tomorrowStr as unknown as any);
      if (!tx.bookingDate) {
        this.logger.log(
          `[PY SEND DATE DEFAULT] tx_id:${tx.id} had null bookingDate -> using tomorrow=${tomorrowStr}`,
        );
      }
      const valueDateForSend = tx.valueDate ?? bookingDateForSend;

      // Log warning if budget is missing
      if (!budget) {
        this.logger.log(
          `[CONVERT_TO_PYTHON] WARNING: Transaction tx_id:${tx.id} has no budget relation loaded! This will cause shared=false`,
        );
      }
      const finalShared = budget?.type === BUDGET_TYPES.SHARED;

      const bankAccountMap = new Map(
        accounts.filter((acc) => acc).map((acc) => [acc?.id, acc]),
      );
      return {
        ...tx,
        id: tx.id.toString(),
        isLast: false,
        count,
        createdAt: tx.createdAt,
        updatedAt: tx.updatedAt,
        deletedAt: null,
        accountType: bankAccountMap.get(tx.accountId)?.type?.type,
        userId: tx.userId,
        accountId: tx.accountId.toString(),
        transactionId: tx.transactionId,
        internalTransactionId: tx.internalTransactionId,
        debtorName: tx.debtorName,
        debtorAccount: tx.debtorAccount?.iban,
        debtorAgent: tx.debtorAgent ?? null,
        creditorName: tx.creditorName,
        creditorAccount: tx.creditorAccount?.iban,
        creditorAgent: tx.creditorAccount ?? null,
        creditorId: tx.creditorId ?? null,
        entryReference: tx.entryReference,
        mandateId: tx.mandateId ?? null,
        merchantCategoryCode: tx.merchantCategoryCode ?? null,
        checkId: tx.checkId ?? null,
        bankTransactionCode: tx.bankTransactionCode,
        proprietaryBankTransactionCode:
          tx.proprietaryBankTransactionCode ?? tx.transactionType,
        purposeCode: tx.purposeCode ?? null,
        additionalDataStructured: tx.additionalDataStructured ?? null,
        transactionAmount: {
          amount: Math.abs(
            Number(tx.transactionAmount?.amount ?? tx.amount),
          ).toString(),
          currency: tx.transactionAmount.currency,
        },
        remittanceInformationUnstructured:
          tx.remittanceInformationUnstructured ?? tx.description,
        bookingDate: bookingDateForSend,
        valueDate: valueDateForSend,
        description:
          tx.description ??
          tx.remittanceInformationUnstructured ??
          tx.remittanceInformationStructured,
        type: 'booked',
        systemTransactionId: tx.id.toString(),
        transactionType: tx.transactionType,
        operationType: tx.proprietaryBankTransactionCode ?? tx.transactionType,
        userMetadata,
        isRecurring: tx.isRecurring,
        shared: finalShared,
        isSyncTransaction: publishToSyncingTopic,
      };
    });
  }

  recurringMarks(transactions: CreateTransactionDto[]) {
    if (transactions.length === 0) return [];
    const creditorMap: RecurringMarksCreditorMap = new Map();

    transactions.forEach((tx) => {
      const iban = tx.transaction?.creditorAccount?.iban;
      if (iban) {
        if (!creditorMap.has(iban)) {
          creditorMap.set(iban, []);
        }
        creditorMap.get(iban).push(tx);
      }
    });

    creditorMap.forEach((txList) => {
      if (txList.length < 2) return;

      const sortedDates = txList
        .filter((t) => t.transaction.bookingDate)
        .map(
          (tx) =>
            new Date(tx.transaction?.bookingDate ?? tx.transaction?.valueDate),
        )
        .sort((a, b) => a.getTime() - b.getTime());

      const differences: number[] = [];
      for (let i = 0; i < sortedDates.length - 1; i++) {
        const diffInMs =
          sortedDates[i + 1].getTime() - sortedDates[i].getTime();
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
        differences.push(diffInDays);
      }

      const averageDiff =
        differences.reduce((sum, d) => sum + d, 0) / differences.length;

      const isRecurring = averageDiff > 25;
      const groupId = v4();
      txList.forEach((tx) => {
        tx.transaction.isRecurring = isRecurring;
        tx.transaction.recurringGroupId = groupId;
      });
    });

    return transactions;
  }

  roundToTwo(value: number | string): number {
    return Math.round(Number(value) * 100) / 100;
  }

  getCacheKey(folder: string, id: number) {
    return `${folder}:${id}`;
  }

  currentQuarterWeeks() {
    const quarter = moment.utc().quarter(); // 1–4
    const year = moment.utc().year();

    const start = moment.utc().year(year).quarter(quarter).startOf('quarter');
    const end = moment.utc().year(year).quarter(quarter).endOf('quarter');

    const totalWeeks = end.isoWeek() - start.isoWeek() + 1;

    if (end.isoWeek() < start.isoWeek()) {
      const weeksInYear = moment.utc().isoWeeksInYear();
      const adjustedWeeks = weeksInYear - start.isoWeek() + end.isoWeek() + 1;
      return adjustedWeeks;
    }
    return totalWeeks;
  }

  getDateRange(period?: string, startDate?: string, endDate?: string) {
    if (startDate || endDate) {
      return {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      };
    }

    if (!period) return { startDate: undefined, endDate: undefined };

    const now = new Date();
    let start: Date;
    let end: Date = now;

    switch (period) {
      case 'current_month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'last_month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'current_year':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      case 'last_3_months':
        start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case 'last_6_months':
        start = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      default:
        return { startDate: undefined, endDate: undefined };
    }

    return { startDate: start, endDate: end };
  }

  formatDisplayDate(date: Date): string {
    const today = moment.utc().startOf('day');
    const targetDate = moment(date).utc().startOf('day');

    const diffDays = targetDate.diff(today, 'days');

    if (diffDays === 0) {
      return 'Today';
    }
    if (diffDays === 1) {
      return 'Tomorrow';
    }
    if (diffDays < 7) {
      return targetDate.format('dddd');
    }
    return targetDate.format('D MMM');
  }

  buildFrequencyDescription(transaction: any): string {
    const frequency = transaction.frequency;
    const recurringDays = transaction.recurringDays;
    switch (frequency) {
      case INCOME_FREQUENCY.WEEKLY:
        return 'Weekly';

      case INCOME_FREQUENCY.MONTHLY:
        if (typeof recurringDays === 'number') {
          return `Every ${recurringDays} month(s)`;
        }
        return 'Every month';

      case INCOME_FREQUENCY.QUARTERLY:
        return 'Every quarter';

      case INCOME_FREQUENCY.YEARLY:
        return 'Every year';
      case INCOME_FREQUENCY.MINUTELY:
        if (typeof recurringDays === 'number') {
          return `Every ${recurringDays} minute(s)`;
        }
        return 'Every minute';
      default:
        return 'One-time';
    }
  }

  getOrdinalSuffix(day: number): string {
    if (day >= 11 && day <= 13) {
      return 'th';
    }

    switch (day % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  }

  extractNameFromDescription(description: string): string | null {
    if (!description) return null;

    const patterns = [
      /^([A-Z\s]+)\s+\d+/,
      /^([A-Za-z\s]+)\s+-/,
      /^([A-Za-z\s]+)\s+subscription/i,
    ];

    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    const words = description.split(' ');
    return words.slice(0, 2).join(' ');
  }

  getMinutesInCurrentQuarter() {
    const startOfQuarter = moment().startOf('quarter');
    const endOfQuarter = moment().endOf('quarter');

    const daysInQuarter = endOfQuarter.diff(startOfQuarter, 'days') + 1;
    const minutesInQuarter = daysInQuarter * 24 * 60;

    return minutesInQuarter;
  }

  getMinutesInCurrentMonth() {
    const startOfMonth = moment().startOf('month');
    const endOfMonth = moment().endOf('month');

    const daysInMonth = endOfMonth.diff(startOfMonth, 'days') + 1;
    return daysInMonth * 24 * 60;
  }

  safeSetDate(m: moment.Moment, day: number) {
    const daysInMonth = m.daysInMonth();
    return m.date(Math.min(day, daysInMonth));
  }

  getFutureExecutionDate(
    startDate: Date,
    frequency: INCOME_FREQUENCY,
    recurringDays: Record<number, number[]> | number,
    isSeries: boolean,
    test: boolean = false,
  ) {
    this.logger.debug('getFutureExecutionDate called', {
      startDate,
      frequency,
      recurringDays,
      isSeries,
      test,
    });

    let parseRecurringDays = recurringDays;

    const invokedAt = moment.utc();
    this.logger.debug('Invocation timestamp', {
      invokedAt: invokedAt.toISOString(),
    });

    if (test) {
      const result = moment(new Date()).utc().add(10, 'seconds').toDate();
      this.logger.debug('Test mode active, returning fixed result', { result });
      return result;
    }

    if (!frequency && !recurringDays) {
      const result = moment(startDate).utc().toDate();
      this.logger.debug('No frequency/recurringDays, returning startDate', {
        result,
      });
      return result;
    }

    const start = moment(startDate).utc();
    const startTime = {
      hour: start.hour(),
      minute: start.minute(),
      second: start.second(),
      millisecond: start.millisecond(),
    };
    const today = moment.utc().startOf('day');

    this.logger.debug('Base date calculations', {
      start: start.toISOString(),
      startTime,
      today: today.toISOString(),
      now: moment.utc().toISOString(),
    });

    if (frequency === INCOME_FREQUENCY.WEEKLY) {
      this.logger.debug('Processing WEEKLY frequency');

      if (typeof parseRecurringDays !== 'object') {
        const result = moment(startDate).utc().toDate();
        this.logger.debug(
          'Weekly without object parseRecurringDays, returning',
          {
            result,
          },
        );
        parseRecurringDays = {
          '1': [1],
        };
      }

      const repeatWeeksCount = Number(Object.keys(parseRecurringDays)[0]) || 1;
      const repeatDays: number[] = (Object.values(parseRecurringDays)[0] || [1])
        .map(Number)
        .filter((d) => d >= 1 && d <= 7)
        .sort((a, b) => a - b);

      const now = moment.utc();

      this.logger.debug('Weekly config', {
        repeatWeeksCount,
        repeatDays,
        now: now.toISOString(),
        start: start.toISOString(),
      });

      let weeksSinceStart = Math.floor(now.diff(start, 'weeks'));
      if (weeksSinceStart < 0) weeksSinceStart = 0;

      let cycleIndex = Math.floor(weeksSinceStart / repeatWeeksCount);
      if (cycleIndex < 0) cycleIndex = 0;

      this.logger.debug('Weekly initial counters', {
        weeksSinceStart,
        cycleIndex,
      });

      let candidate: moment.Moment | null = null;
      const MAX_CYCLES = 500;

      for (
        let attempt = 0;
        attempt < MAX_CYCLES && !candidate;
        attempt++, cycleIndex++
      ) {
        const cycleAnchor = start
          .clone()
          .add(cycleIndex * repeatWeeksCount, 'weeks');

        this.logger.debug('Weekly cycle iteration', {
          attempt,
          cycleIndex,
          cycleAnchor: cycleAnchor.toISOString(),
        });

        for (const day of repeatDays) {
          const possible = cycleAnchor.clone().isoWeekday(day).set(startTime);

          this.logger.debug('Weekly candidate check', {
            day,
            possible: possible.toISOString(),
            isAfterNow: possible.isAfter(now),
            isAfterStart: possible.isAfter(start),
          });

          if (
            possible.isAfter(now) &&
            (isSeries ? possible.isAfter(start) : true)
          ) {
            candidate = possible;
            this.logger.debug('Weekly candidate selected', {
              candidate: candidate.toISOString(),
            });
            break;
          }
        }
      }

      if (!candidate) {
        this.logger.error('Weekly candidate not found', {
          start: start.toISOString(),
          recurringDays,
        });
        throw new BadRequestException(
          'Unable to compute next weekly execution date',
        );
      }

      const result = candidate.toDate();
      this.logger.debug('Returning WEEKLY result', { result });
      return result;
    }

    if (
      frequency === INCOME_FREQUENCY.MONTHLY ||
      frequency === INCOME_FREQUENCY.QUARTERLY
    ) {
      this.logger.debug('Processing MONTHLY/QUARTERLY frequency');

      const repeatEvery =
        frequency === INCOME_FREQUENCY.MONTHLY
          ? Number(recurringDays) || 1
          : (Number(recurringDays) ?? 0) * 3 || 3;

      this.logger.debug('Monthly/Quarterly config', {
        repeatEvery,
        start: start.toISOString(),
      });

      let candidate = this.safeSetDate(
        moment(start).utc().add(repeatEvery, 'months'),
        start.date(),
      ).set(startTime);

      this.logger.debug('Initial monthly/quarterly candidate', {
        candidate: candidate.toISOString(),
      });

      while (
        !candidate.isAfter(today) &&
        (isSeries ? candidate.isAfter(start) : true)
      ) {
        this.logger.debug('Monthly/Quarterly loop condition met', {
          candidate: candidate.toISOString(),
          today: today.toISOString(),
        });

        candidate = this.safeSetDate(
          candidate.add(repeatEvery, 'months'),
          start.date(),
        ).set(startTime);

        this.logger.debug('Adjusted candidate in loop', {
          candidate: candidate.toISOString(),
        });
      }

      const result = candidate.toDate();
      this.logger.debug('Returning MONTHLY/QUARTERLY candidate', { result });
      return result;
    }

    if (frequency === INCOME_FREQUENCY.YEARLY) {
      this.logger.debug('Processing YEARLY frequency');

      const repeatEvery = Number(recurringDays) || 1;

      this.logger.debug('Yearly config', {
        repeatEvery,
        start: start.toISOString(),
      });

      let candidate = this.safeSetDate(
        moment(start).utc().add(repeatEvery, 'year'),
        start.date(),
      ).set(startTime);

      this.logger.debug('Initial yearly candidate', {
        candidate: candidate.toISOString(),
      });

      while (
        !candidate.isAfter(today) &&
        (isSeries ? candidate.isAfter(start) : true)
      ) {
        this.logger.debug('Yearly loop condition met', {
          candidate: candidate.toISOString(),
          today: today.toISOString(),
        });

        candidate = this.safeSetDate(
          candidate.add(repeatEvery, 'year'),
          start.date(),
        ).set(startTime);

        this.logger.debug('Adjusted yearly candidate', {
          candidate: candidate.toISOString(),
        });
      }

      const result = candidate.toDate();
      this.logger.debug('Returning YEARLY candidate', { result });
      return result;
    }

    if (frequency === INCOME_FREQUENCY.MINUTELY) {
      this.logger.debug('Processing MINUTELY frequency');

      const minuteToday = moment.utc();
      const repeatEvery = Number(recurringDays) || 1;

      this.logger.debug('Minutely config', {
        repeatEvery,
        minuteToday: minuteToday.toISOString(),
      });

      let candidate = moment(start)
        .utc()
        .add(repeatEvery, 'minute')
        .date(start.date())
        .set(startTime);

      this.logger.debug('Initial minutely candidate', {
        candidate: candidate.toISOString(),
      });

      while (
        !candidate.isAfter(minuteToday) &&
        (isSeries ? !candidate.isAfter(start) : true)
      ) {
        this.logger.debug('Minutely loop condition met', {
          candidate: candidate.toISOString(),
        });

        candidate = candidate.add(repeatEvery, 'minute');

        this.logger.debug('Adjusted minutely candidate', {
          candidate: candidate.toISOString(),
        });
      }

      const result = candidate.toDate();
      this.logger.debug('Returning MINUTELY candidate', { result });
      return result;
    }

    this.logger.error('Invalid frequency received', { frequency });
    throw new BadRequestException('Invalid frequency');
  }

  isFutureTransactionEnded(data: {
    frequency: INCOME_FREQUENCY;
    count: number;
    recurringEndMethod: RECURRING_END_METHOD;
    recurringEndValue: string;
    amount: number;
    uniqueJobId: string;
  }) {
    const parsedEndValue =
      data.recurringEndMethod !== RECURRING_END_METHOD.DATE
        ? Math.abs(parseFloat(data.recurringEndValue))
        : new Date(data.recurringEndValue);
    const today = moment.utc();
    const { frequency, count, recurringEndMethod, uniqueJobId, amount } = data;
    if (frequency && count > 0) {
      if (recurringEndMethod) {
        switch (recurringEndMethod as RECURRING_END_METHOD) {
          case RECURRING_END_METHOD.OCCURRENCE:
            if (count > Math.floor(parsedEndValue as number)) {
              return {
                amount: null,
                isFutureTransaction: false,
                uniqueJobId,
                end: true,
              };
            }
            if (count === Math.floor(parsedEndValue as number)) {
              return {
                amount: null,
                isFutureTransaction: false,
                uniqueJobId,
                end: false,
              };
            }

            break;
          case RECURRING_END_METHOD.AMOUNT:
            {
              if ((count - 1) * amount >= (parsedEndValue as number)) {
                return {
                  amount: null,
                  isFutureTransaction: false,
                  uniqueJobId,
                  end: true,
                };
              }
              const totalAmountTransferred = count * amount;
              if (totalAmountTransferred >= (parsedEndValue as number)) {
                return {
                  amount: null,
                  isFutureTransaction: false,
                  uniqueJobId,
                  end: false,
                };
              }
              if (totalAmountTransferred < (parsedEndValue as number)) {
                if (
                  totalAmountTransferred + amount >
                  (parsedEndValue as number)
                ) {
                  return {
                    amount: Math.abs(
                      (parsedEndValue as number) - totalAmountTransferred,
                    ),
                    isFutureTransaction: false,
                    uniqueJobId,
                    end: false,
                  };
                }
              }
            }
            break;
          case RECURRING_END_METHOD.DATE:
            if (
              moment(parsedEndValue as Date)
                .utc()
                .isBefore(today, 'day')
            ) {
              return {
                amount: null,
                isFutureTransaction: false,
                uniqueJobId,
                end: true,
              };
            }
            break;
          default:
            break;
        }
      }
    }
    return false;
  }

  calculateTransactionMonthlyAmount(
    transactions: any[],
    baseCurrencyId: number,
    exchangeRateMap: Map<number, number>,
  ) {
    const minutesInMonth = this.getMinutesInCurrentMonth();

    const frequencyMultipliers: Record<INCOME_FREQUENCY, number> = {
      [INCOME_FREQUENCY.MONTHLY]: 1,
      [INCOME_FREQUENCY.YEARLY]: 1 / 12,
      [INCOME_FREQUENCY.QUARTERLY]: 1 / 3,
      [INCOME_FREQUENCY.WEEKLY]: 365.25 / 7 / 12,
      [INCOME_FREQUENCY.MINUTELY]: minutesInMonth,
      [INCOME_FREQUENCY.ONE_OFF]: 1,
    };

    let total = 0;

    for (const t of transactions) {
      const multiplier = frequencyMultipliers[t.frequency as INCOME_FREQUENCY];
      if (!multiplier) continue;

      const rate =
        t.currencyId === baseCurrencyId
          ? 1
          : (exchangeRateMap.get(t.currencyId) ?? 1);

      total += Math.abs(+t.amount) * rate * multiplier;
    }

    return total;
  }

  calculateExpenseMonthlyAverage(
    expense: Expense,
    currencyId: number,
    defaultCurrencyId: number,
    exchangeRates: Map<number, number>,
  ) {
    const exchangeRate = exchangeRates.get(currencyId);
    const adjustedAmount =
      currencyId !== defaultCurrencyId
        ? Number(expense.amount) * (exchangeRate ?? 1)
        : Number(expense.amount);
    if ((expense as Expense).isGoal) {
      return this.roundToTwo(adjustedAmount);
    }
    let amount = 0;
    switch (expense.frequency) {
      case INCOME_FREQUENCY.YEARLY: {
        amount = adjustedAmount / 12;
        break;
      }
      case INCOME_FREQUENCY.QUARTERLY: {
        amount = adjustedAmount / 3;
        break;
      }
      case INCOME_FREQUENCY.WEEKLY: {
        amount = adjustedAmount * (365.25 / 7 / 12);
        break;
      }
      case INCOME_FREQUENCY.MINUTELY: {
        amount = adjustedAmount * this.getMinutesInCurrentMonth();
        break;
      }
      default: {
        amount = adjustedAmount;
        break;
      }
    }
    return this.roundToTwo(amount);
  }

  /**
   * Calculate the actual expense amount based on the selected frequency
   * (without converting to monthly - returns the amount as stored)
   */
  // Todo later full implementation waiting
  calculateExpenseAmount(
    expense: Expense,
    currencyId: number,
    defaultCurrencyId: number,
    exchangeRates: Map<number, number>,
  ): number {
    const exchangeRate = exchangeRates.get(currencyId);
    const adjustedAmount =
      currencyId !== defaultCurrencyId
        ? Number(expense.amount) * (exchangeRate ?? 1)
        : Number(expense.amount);
    return this.roundToTwo(adjustedAmount);
  }

  calculateExpenseRefillOccurrenceAmount(
    expense: Expense,
    currencyId: number,
    defaultCurrencyId: number,
    exchangeRates: Map<number, number>,
  ): number {
    const effectiveRefill = expense.refillFrequency ?? INCOME_FREQUENCY.MONTHLY;

    const exchangeRate = exchangeRates.get(currencyId);
    const adjustedBase =
      currencyId !== defaultCurrencyId
        ? Number(expense.amount) * (exchangeRate ?? 1)
        : Number(expense.amount);

    const from = expense.frequency ?? INCOME_FREQUENCY.MONTHLY;

    const toWeekly = (): number => {
      switch (from) {
        case INCOME_FREQUENCY.WEEKLY:
          return adjustedBase;
        case INCOME_FREQUENCY.MONTHLY:
          return adjustedBase / WEEKS_IN_MONTH;
        case INCOME_FREQUENCY.QUARTERLY:
          return adjustedBase / MONTHS_IN_QUARTER / WEEKS_IN_MONTH;
        case INCOME_FREQUENCY.YEARLY:
          return adjustedBase / WEEKS_IN_YEAR;
        case INCOME_FREQUENCY.MINUTELY: {
          const minutesInWeek = DAYS_IN_WEEK * 24 * 60;
          return adjustedBase * minutesInWeek;
        }
        default:
          return adjustedBase / WEEKS_IN_MONTH;
      }
    };

    const toMonthly = (): number => {
      return this.calculateExpenseMonthlyAverage(
        expense,
        currencyId,
        defaultCurrencyId,
        exchangeRates,
      );
    };

    const toQuarterly = (): number => {
      switch (from) {
        case INCOME_FREQUENCY.QUARTERLY:
          return adjustedBase;
        case INCOME_FREQUENCY.MONTHLY:
          return adjustedBase * MONTHS_IN_QUARTER;
        case INCOME_FREQUENCY.WEEKLY:
          return (adjustedBase * WEEKS_IN_YEAR) / QUARTERS_IN_YEAR;
        case INCOME_FREQUENCY.YEARLY:
          return adjustedBase / QUARTERS_IN_YEAR;
        case INCOME_FREQUENCY.MINUTELY: {
          const minutesInYear = AVG_DAYS_IN_YEAR * 24 * 60;
          const minutesInQuarter = minutesInYear / QUARTERS_IN_YEAR;
          return adjustedBase * minutesInQuarter;
        }
        default:
          return adjustedBase * MONTHS_IN_QUARTER;
      }
    };

    const toYearly = (): number => {
      switch (from) {
        case INCOME_FREQUENCY.YEARLY:
          return adjustedBase;
        case INCOME_FREQUENCY.QUARTERLY:
          return adjustedBase * QUARTERS_IN_YEAR;
        case INCOME_FREQUENCY.MONTHLY:
          return adjustedBase * 12;
        case INCOME_FREQUENCY.WEEKLY:
          return adjustedBase * WEEKS_IN_YEAR;
        case INCOME_FREQUENCY.MINUTELY: {
          const minutesInYear = AVG_DAYS_IN_YEAR * 24 * 60;
          return adjustedBase * minutesInYear;
        }
        default:
          return adjustedBase * 12;
      }
    };

    const toMinutely = (): number => {
      return adjustedBase;
    };

    let result: number;
    switch (effectiveRefill) {
      case INCOME_FREQUENCY.WEEKLY:
        result = toWeekly();
        break;
      case INCOME_FREQUENCY.MONTHLY:
        result = toMonthly();
        break;
      case INCOME_FREQUENCY.QUARTERLY:
        result = toQuarterly();
        break;
      case INCOME_FREQUENCY.YEARLY:
        result = toYearly();
        break;
      case INCOME_FREQUENCY.MINUTELY:
        result = toMinutely();
        break;
      default:
        result = toMonthly();
        break;
    }

    return this.roundToTwo(result);
  }

  calculateExpenseAmountLeft(
    expense: Expense,
    // expenseMonthlyAverage: number,
    expenseMonthlyAverageCurrencyId: number,
    exchangeRateMap: Map<number, number>,
    bookingDate?: Date,
  ) {
    // const currentAmountLeft = this.getCurrentAmountLeftForExpense(expense);
    const exchangeRate =
      expenseMonthlyAverageCurrencyId !== expense.currencyId
        ? (exchangeRateMap.get(expense.currencyId) ?? 1)
        : 1;
    const currentMonth =
      moment(bookingDate ?? new Date())
        .utc()
        .month() + 1;
    const currentYear = moment(bookingDate ?? new Date())
      .utc()
      .year();
    const thisMonthsAmountLeft = expense.amountLeft.find(
      (a) => a.periodMonth === currentMonth && a.periodYear === currentYear,
    );

    let {
      amountInvested: totalMonthAmountInvested,
      // eslint-disable-next-line prefer-const
      periodMonth,
      // eslint-disable-next-line prefer-const
      periodYear,
      savedAmount,
    } = thisMonthsAmountLeft || {
      amountInvested: 0,
      periodMonth: currentMonth,
      periodYear: currentYear,
      savedAmount: 0,
    };
    if (periodMonth !== currentMonth || periodYear !== currentYear) {
      totalMonthAmountInvested = 0;
    }
    // if (!currentAmountLeft)
    return {
      totalMonthAmountInvested:
        (Number(totalMonthAmountInvested) || 0) * exchangeRate,
      savedAmount: Number(savedAmount) || 0,
    };
    // return {
    //   totalMonthAmountInvested: 0
    //  ( Number(totalMonthAmountInvested) * exchangeRate) +
    // expenseMonthlyAverage -
    // (currentAmountLeft * exchangeRate),
  }

  // getCurrentAmountLeftForExpense(expense: Expense) {
  //   const currentMonth = moment().utc().month() + 1;
  //   const currentYear = moment().utc().year();
  //   const expenseCreatedAtMonth = moment(expense.createdAt).utc().month() + 1;
  //   const expenseCreatedAtYear = moment(expense.createdAt).utc().year();
  //   if (
  //     expenseCreatedAtMonth === currentMonth &&
  //     expenseCreatedAtYear === currentYear
  //   ) {
  //     // if (
  //     //   expense.amountLeftUser !== null &&
  //     //   expense.amountLeftUser !== undefined
  //     // ) {
  //     //   return Number(expense.amountLeftUser);
  //     // }
  //   }
  //   return null;
  // }

  calculateExpenseAmountLeftForGoal(
    expense: Expense,
    // expenseMonthlyAverage: number,
    expenseMonthlyAverageCurrencyId: number,
    exchangeRateMap: Map<number, number>,
    bookingDate?: Date,
  ) {
    // const currentAmountLeft = this.getCurrentAmountLeftForExpense(expense);
    const currentMonth =
      moment(bookingDate ?? new Date())
        .utc()
        .month() + 1;
    const currentYear = moment(bookingDate ?? new Date())
      .utc()
      .year();
    const allMonthsAmountLeft = expense.amountLeft.sort((a, b) => {
      if (a.periodYear !== b.periodYear) {
        return a.periodYear - b.periodYear;
      }
      return a.periodMonth - b.periodMonth;
    });

    const amountInvested =
      allMonthsAmountLeft.reduce((acc, curr) => acc + curr.amountInvested, 0) ||
      0;
    const exchangeRate =
      expenseMonthlyAverageCurrencyId !== expense.currencyId
        ? (exchangeRateMap.get(expense.currencyId) ?? 1)
        : 1;
    const currentMonthsAmountLeft = allMonthsAmountLeft.find(
      (a) => a.periodMonth === currentMonth && a.periodYear === currentYear,
    );
    // if (!currentAmountLeft)
    // {

    //   return {
    //     totalMonthAmountInvested: (Number(amountInvested)  || 0) * exchangeRate,
    //   };}
    return {
      totalMonthAmountInvested: Number(amountInvested) * exchangeRate,
      savedAmount: Number(currentMonthsAmountLeft?.savedAmount || 0),
      // (Number(amountInvested) * exchangeRate) + expenseMonthlyAverage - (currentAmountLeft * exchangeRate),
    };
  }

  calculateIncomeTransaction(
    incomeTransactions: IncomeTransaction[],
    defaultCurrencyId: number,
    exchangeRates: Map<number, number>,
    budgetsPeriods: Map<number, { start: Date; end: Date }>,
  ) {
    const thisMonthsTransactions = incomeTransactions.filter((t) => {
      const budgetPeriod = budgetsPeriods.get(t.transaction.budgetId);
      return moment
        .utc(t.transaction.bookingDate)
        .isBetween(budgetPeriod.start, budgetPeriod.end, undefined, '[]');
    });
    const creditTransactions = thisMonthsTransactions.filter(
      (t) => t.transaction.transactionType === 'credit',
    );
    const totalMonthAmountAdded = creditTransactions.reduce(
      (total, t) =>
        total +
        this.getTransactionAmount(
          t.transaction,
          defaultCurrencyId,
          exchangeRates,
        ),
      0,
    );
    return { totalMonthAmountAdded };
  }

  getTransactionAmount(
    transaction: Transaction,
    defaultCurrencyId: number,
    exchangeRates: Map<number, number>,
  ) {
    const exchangeRate = exchangeRates.get(
      transaction.currencyId ?? defaultCurrencyId,
    );
    return Math.abs(
      Number(
        transaction.amount ?? (transaction.transactionAmount?.amount || 0),
      ) * exchangeRate,
    );
  }

  autoMapperForMembers(dto: Record<string, string>) {
    return Object.entries(dto).map(([key, value]) =>
      forMember(
        (d) => d[key],
        mapFrom((s) => s[value]),
      ),
    );
  }

  getLastNinetyDays(format?: string): string {
    return moment()
      .utc()
      .subtract(89, 'day')
      .format(format ?? 'YYYY-MM-DD');
  }

  // getApplicableChanges(
  //   recurrenceChanges: RecurrenceChanges,
  //   currentDate: moment.Moment,
  // ) {
  //   return Object.entries(recurrenceChanges || {})
  //     .filter(([changeDate]) =>
  //       moment(changeDate).utc().isSame(currentDate, 'day'), // 👈 Change this line
  //     )
  //     .sort((a, b) => moment(a[0]).valueOf() - moment(b[0]).valueOf())
  //     .pop();
  // }

  getApplicableChanges(
    recurrenceChanges: RecurrenceChanges,
    currentDate: moment.Moment,
  ) {
    return Object.entries(recurrenceChanges || {})
      .filter(([changeDate]) =>
        moment(changeDate).utc().isSame(currentDate, 'day'),
      )
      .sort((a, b) => moment(a[0]).valueOf() - moment(b[0]).valueOf())
      .pop();
  }

  calculateUpcomingTransactionDates(
    transaction: ScheduledTransactionDto | ScheduledTransactions,
    startDate: Date,
    endDate: Date,
    skippers: string[],
    recurrenceChanges: RecurrenceChanges,
  ): {
    upcomingDates: Array<{
      date: Date;
      amount: number;
      recurringEndMethod: RECURRING_END_METHOD;
      recurringDays: any;
      recurringEndValue: string;
      frequency: INCOME_FREQUENCY;
      splitSettings: any;
    }>;
    transaction: ScheduledTransactionDto | ScheduledTransactions;
  } {
    const upcomingDates: Array<{
      date: Date;
      amount: number;
      recurringEndMethod: RECURRING_END_METHOD;
      recurringDays: any;
      recurringEndValue: string;
      frequency: INCOME_FREQUENCY;
      splitSettings: any;
    }> = [];

    const bookingDate = moment(
      transaction.scheduledDate || transaction['bookingDate'],
    ).utc();

    const {
      frequency,
      recurringDays,
      recurringEndMethod,
      recurringEndValue,
      splitSettings,
    } = transaction;
    let parsedRecurringDays = recurringDays;
    if (frequency === 'Weekly' && typeof recurringDays !== 'object') {
      parsedRecurringDays = {
        '1': [1],
      };
    }
    const originalAmount = Math.abs(Number(transaction.amount)) || 0;

    // ========== STEP 1: CREATE CLONE OF MAIN TRANSACTION WITH CHANGES ==========
    const mainTransactionClone = { ...transaction };
    // Current settings for future dates (can be modified by permanent changes)
    let currentFrequency = frequency;
    let currentRecurringDays = parsedRecurringDays;
    let currentRecurringEndMethod = recurringEndMethod;
    let currentRecurringEndValue = recurringEndValue;
    let currentAmount = originalAmount;
    let currentSplitSettings = splitSettings;

    // Check if there are recurrence changes for the main transaction date
    const mainTransactionChanges = this.getApplicableChanges(
      recurrenceChanges,
      bookingDate,
    );

    if (mainTransactionChanges) {
      const [, settings] = mainTransactionChanges;

      // Apply amount change if present
      if (settings.transactionAmount?.amount) {
        const parsed = Number(settings.transactionAmount.amount);
        if (Number.isFinite(parsed)) {
          const newAmount = Math.abs(parsed);
          mainTransactionClone.amount = newAmount;

          // If carryOnEffect is true, update currentAmount for future transactions too
          if (settings.carryOnEffect === true) {
            currentAmount = newAmount;
          }
        }
      }

      // Apply split settings if present
      if (settings.splitSettings !== undefined) {
        mainTransactionClone.splitSettings = settings.splitSettings;

        // If carryOnEffect is true, update currentSplitSettings for future transactions too
        if (settings.carryOnEffect === true) {
          currentSplitSettings = settings.splitSettings;
        }
      }

      // Apply permanent changes to frequency/recurrence settings
      if (settings.carryOnEffect === true) {
        if (settings.frequency) {
          mainTransactionClone.frequency = settings.frequency;
          currentFrequency = settings.frequency;
        }
        if (settings.recurringDays) {
          if (
            (settings.frequency || currentFrequency) ===
              INCOME_FREQUENCY.WEEKLY &&
            typeof settings.recurringDays !== 'object'
          ) {
            mainTransactionClone.recurringDays = {
              '1': [1],
            };
            currentRecurringDays = {
              '1': [1],
            };
          } else {
            mainTransactionClone.recurringDays = settings.recurringDays;
            currentRecurringDays = settings.recurringDays;
          }
        }
        if (settings.recurringEndMethod) {
          mainTransactionClone.recurringEndMethod = settings.recurringEndMethod;
          currentRecurringEndMethod = settings.recurringEndMethod;
        }
        if (settings.recurringEndValue) {
          mainTransactionClone.recurringEndValue = settings.recurringEndValue;
          currentRecurringEndValue = settings.recurringEndValue;
        }
      } else {
        this.logger.debug('⏰ ONE-TIME CHANGE - ONLY AFFECTS MAIN TRANSACTION');
      }
    }

    // ========== STEP 2: PROCESS FUTURE DATES (EXISTING LOGIC) ==========
    let currentDate = bookingDate;
    let { count } = transaction;
    count += 1;

    const monthStart = moment(startDate).utc();
    const monthEnd = moment(endDate).utc();

    // Track one-time change state
    let hasOneTimeChangeForNextDate = false;
    let oneTimeChangeAmount: number | null = null;
    let oneTimeChangeSplitSettings: any = null;

    let iteration = 0;

    while (currentDate.isSameOrBefore(monthEnd)) {
      iteration++;

      // ========== SET EFFECTIVE VALUES FOR THIS DATE ==========
      let effectiveFrequency = currentFrequency;
      let effectiveRecurringDays = currentRecurringDays;
      let effectiveRecurringEndMethod = currentRecurringEndMethod;
      let effectiveRecurringEndValue = currentRecurringEndValue;
      let effectiveAmount = currentAmount;
      let effectiveSplitSettings = currentSplitSettings;

      // ========== CHECK FOR CHANGES ON CURRENT DATE ==========
      // Skip checking the main transaction date since we already processed it
      if (!currentDate.isSame(bookingDate)) {
        const applicableChange = this.getApplicableChanges(
          recurrenceChanges,
          currentDate,
        );

        if (applicableChange) {
          const [, settings] = applicableChange;

          if (settings.carryOnEffect === false) {
            // One-time change: only apply to this specific date
            const parsed = Number(settings.transactionAmount?.amount);
            effectiveAmount = Number.isFinite(parsed)
              ? Math.abs(parsed)
              : effectiveAmount;
            if (settings.splitSettings !== undefined) {
              effectiveSplitSettings = settings.splitSettings;
            }
          } else {
            // Permanent change: update current settings for all future dates
            currentFrequency = settings.frequency ?? currentFrequency;
            currentRecurringDays =
              settings.recurringDays ?? currentRecurringDays;
            if (
              typeof settings.recurringDays !== 'object' &&
              currentFrequency === INCOME_FREQUENCY.WEEKLY
            ) {
              currentRecurringDays = {
                '1': [1],
              };
            }
            currentRecurringEndMethod =
              settings.recurringEndMethod ?? currentRecurringEndMethod;
            currentRecurringEndValue =
              settings.recurringEndValue ?? currentRecurringEndValue;
            const parsed = Number(settings.transactionAmount?.amount);
            currentAmount = Number.isFinite(parsed)
              ? Math.abs(parsed)
              : currentAmount;
            if (settings.splitSettings !== undefined) {
              currentSplitSettings = settings.splitSettings;
            }

            // Also update effective settings for this date
            effectiveFrequency = currentFrequency;
            effectiveRecurringDays = currentRecurringDays;
            effectiveRecurringEndMethod = currentRecurringEndMethod;
            effectiveRecurringEndValue = currentRecurringEndValue;
            effectiveAmount = currentAmount;
            effectiveSplitSettings = currentSplitSettings;
          }
        }
      }

      // ========== APPLY ONE-TIME CHANGE FOR THIS DATE IF SET ==========
      if (hasOneTimeChangeForNextDate && currentDate.isAfter(bookingDate)) {
        if (oneTimeChangeAmount !== null) {
          effectiveAmount = oneTimeChangeAmount;
        }
        if (oneTimeChangeSplitSettings !== null) {
          effectiveSplitSettings = oneTimeChangeSplitSettings;
        }

        // Reset the one-time change flags after applying
        hasOneTimeChangeForNextDate = false;
        oneTimeChangeAmount = null;
        oneTimeChangeSplitSettings = null;
      }

      // ========== CHECK FOR NO FREQUENCY (ONE-TIME TRANSACTION) ==========
      if (!effectiveFrequency) {
        // Only add to upcomingDates if it's not the main transaction date
        if (currentDate.isAfter(bookingDate)) {
          upcomingDates.push({
            date: currentDate.toDate(),
            amount: effectiveAmount,
            recurringEndMethod: effectiveRecurringEndMethod,
            recurringDays: effectiveRecurringDays,
            recurringEndValue: effectiveRecurringEndValue,
            frequency: effectiveFrequency,
            splitSettings: effectiveSplitSettings,
          });
        }
        break;
      }

      // ========== HANDLE SPLIT SETTINGS ==========
      const amountBeforeSplit = effectiveAmount;
      if (effectiveSplitSettings) {
        effectiveAmount += Number(effectiveSplitSettings.amount);
      }

      // ========== CHECK IF TRANSACTION SHOULD END ==========
      const endCheck = this.isFutureTransactionEnded({
        frequency: effectiveFrequency,
        count,
        recurringEndMethod: effectiveRecurringEndMethod,
        recurringEndValue: effectiveRecurringEndValue,
        amount: effectiveAmount,
        uniqueJobId: '',
      });

      if (
        typeof endCheck === 'object' &&
        (endCheck.end || endCheck.amount === null)
      ) {
        break;
      }

      // ========== CALCULATE NEXT EXECUTION DATE ==========
      const nextExecutionDate = this.getFutureExecutionDate(
        currentDate.toDate(),
        effectiveFrequency,
        effectiveRecurringDays,
        true,
      );

      // ========== CHECK FOR ONE-TIME CHANGES ON NEXT DATE ==========
      if (nextExecutionDate) {
        const nextMoment = moment(nextExecutionDate).utc();
        const applicableChangesForNextDate = this.getApplicableChanges(
          recurrenceChanges,
          nextMoment,
        );

        if (applicableChangesForNextDate) {
          const [, settings] = applicableChangesForNextDate;

          if (settings.carryOnEffect === false) {
            // Store the one-time change for the next iteration
            hasOneTimeChangeForNextDate = true;
            const parsed = Number(settings.transactionAmount?.amount);
            oneTimeChangeAmount = Number.isFinite(parsed)
              ? Math.abs(parsed)
              : null;
            oneTimeChangeSplitSettings = settings.splitSettings;
          }
        }
      }

      if (!nextExecutionDate) {
        break;
      }

      const nextMoment = moment(nextExecutionDate).utc();

      // ========== PROCESS CURRENT DATE IF WITHIN RANGE AND NOT MAIN TRANSACTION ==========
      if (
        currentDate.isBetween(monthStart, monthEnd, null, '[]') &&
        currentDate.isAfter(bookingDate)
      ) {
        // Calculate adjusted amount for recurring limits
        let adjustedAmount = amountBeforeSplit;
        console.log('adjustedAmount', adjustedAmount);
        let totalAdjustedAmount = adjustedAmount;
        if (effectiveSplitSettings) {
          totalAdjustedAmount += Number(effectiveSplitSettings.amount);
        }

        if (effectiveRecurringEndMethod === RECURRING_END_METHOD.AMOUNT) {
          const totalAmountTransferred = count * Math.abs(totalAdjustedAmount);
          const remainingAmount =
            parseFloat(effectiveRecurringEndValue) - totalAmountTransferred;

          if (Math.abs(totalAdjustedAmount) > remainingAmount) {
            adjustedAmount = Math.sign(totalAdjustedAmount) * remainingAmount;
            if (effectiveSplitSettings) {
              adjustedAmount /= 2;
              effectiveSplitSettings.amount = Math.abs(adjustedAmount / 2);
            }
          }
        }

        upcomingDates.push({
          date: currentDate.toDate(),
          amount: amountBeforeSplit,
          recurringEndMethod: effectiveRecurringEndMethod,
          recurringDays: effectiveRecurringDays,
          recurringEndValue: effectiveRecurringEndValue,
          frequency: effectiveFrequency,
          splitSettings: effectiveSplitSettings,
        });
      } else {
        this.logger.debug(
          '❌ CURRENT DATE IS OUTSIDE RANGE OR IS MAIN TRANSACTION, SKIPPING',
        );
      }

      // ========== PREPARE FOR NEXT ITERATION ==========
      currentDate = nextMoment;
      count++;

      if (count > 100) {
        break;
      }
    }

    const upcomingDatesFiltered = upcomingDates.filter(
      (date) => !skippers.includes(date.date.toISOString()),
    );

    const shouldIncludeTransaction = !skippers.includes(
      new Date(transaction.bookingDate).toISOString(),
    );

    const result = {
      upcomingDates: upcomingDatesFiltered,
      transaction: shouldIncludeTransaction ? mainTransactionClone : null,
    };

    return result;
  }

  pickBestBalance(balances: BankBalance[]): BankBalance {
    if (!balances) return null;
    if (balances.length === 1) return balances[0];
    if (balances.length === 0) return undefined;
    const priority = [
      // default
      'default',
      'interimAvailable',
      'closingAvailable',
      'forwardAvailable',
      'CLOSING_AVAILABLE',
      'INTERIM_AVAILABLE',
      'FORWARD_AVAILABLE',
      'confirmed_funds',

      'closingBooked',
      'interimBooked',
      'BOOKED',
      'CLBD',
      'CLOSING_BOOKED',
      'INTERIM_BOOKED',
      'CLOSING_CLEARED',
      'INTERIM_CLEARED',

      'authorised',
      'AUTHORISED',
      'pending_payments_submitted',
      'pending_payouts',

      'expected',
      'XPCD',
      'OTHR',
      'EXPECTED',
      'OTHER',
      'UNKNOWN',
      'INFORMATION',
    ];
    for (const key of priority) {
      const found = balances.find((bal) => bal.type === key);
      if (found) return found;
    }
    if (balances.length > 0) {
      return balances.sort((a, b) => {
        const dateA = a.referenceDate ? new Date(a.referenceDate).getTime() : 0;
        const dateB = b.referenceDate ? new Date(b.referenceDate).getTime() : 0;
        return dateB - dateA;
      })[0];
    }
    return undefined;
  }

  pickBestBalanceFromYapily(
    balances: Array<{
      type: string;
      dateTime: string;
      balanceAmount: {
        amount: number;
        currency: string;
      };
    }>,
  ): {
    type: string;
    dateTime: string;
    balanceAmount: {
      amount: number;
      currency: string;
    };
  } {
    if (!balances || balances.length === 0) return null;
    if (balances.length === 1) return balances[0];
    const priority = [
      // default
      'default',
      'interimAvailable',
      'closingAvailable',
      'forwardAvailable',
      'CLOSING_AVAILABLE',
      'INTERIM_AVAILABLE',
      'FORWARD_AVAILABLE',
      'confirmed_funds',

      'closingBooked',
      'interimBooked',
      'BOOKED',
      'CLBD',
      'CLOSING_BOOKED',
      'INTERIM_BOOKED',
      'CLOSING_CLEARED',
      'INTERIM_CLEARED',

      'authorised',
      'AUTHORISED',
      'pending_payments_submitted',
      'pending_payouts',

      'expected',
      'XPCD',
      'OTHR',
      'EXPECTED',
      'OTHER',
      'UNKNOWN',
      'INFORMATION',
    ];
    for (const key of priority) {
      const found = balances.find((bal) => bal.type === key);
      if (found) return found;
    }
    if (balances.length > 0) {
      return balances.sort((a, b) => {
        const dateA = a.dateTime ? this.safeDateFromYapily(a.dateTime) : 0;
        const dateB = b.dateTime ? this.safeDateFromYapily(b.dateTime) : 0;
        return dateB - dateA;
      })[0];
    }
    return undefined;
  }

  getBudgetPeriod(option: any): {
    start: Date;
    end: Date;
  } {
    const now = new Date();
    const utcYear = now.getUTCFullYear();
    const utcMonth = now.getUTCMonth();
    const utcDay = now.getUTCDate();

    let start: Date;
    let end: Date;

    if (option === BudgetRefillDay.firstDayOfMonth) {
      start = new Date(Date.UTC(utcYear, utcMonth, 1));

      const lastDayOfMonth = new Date(
        Date.UTC(utcYear, utcMonth + 1, 0),
      ).getUTCDate();
      end = new Date(Date.UTC(utcYear, utcMonth, lastDayOfMonth));
    } else if (option === BudgetRefillDay.lastDayOfMonth) {
      const lastDay = new Date(Date.UTC(utcYear, utcMonth + 1, 0)).getUTCDate();

      if (utcDay === lastDay) {
        start = new Date(Date.UTC(utcYear, utcMonth, lastDay));
        const nextMonthLastDay = new Date(
          Date.UTC(utcYear, utcMonth + 2, 0),
        ).getUTCDate();
        end = new Date(Date.UTC(utcYear, utcMonth + 1, nextMonthLastDay));
      } else {
        start = new Date(Date.UTC(utcYear, utcMonth, 0));
        end = new Date(Date.UTC(utcYear, utcMonth, lastDay - 1));
      }
    } else if (option === BudgetRefillDay.penultimate) {
      const lastDay = new Date(Date.UTC(utcYear, utcMonth + 1, 0)).getUTCDate();
      const penultimateDay = lastDay - 1;

      if (utcDay === penultimateDay) {
        start = new Date(Date.UTC(utcYear, utcMonth, penultimateDay));
        const nextLastDay = new Date(
          Date.UTC(utcYear, utcMonth + 2, 0),
        ).getUTCDate();
        end = new Date(Date.UTC(utcYear, utcMonth + 1, nextLastDay - 1));
      } else if (utcDay > penultimateDay) {
        start = new Date(Date.UTC(utcYear, utcMonth, penultimateDay));
        const nextLastDay = new Date(
          Date.UTC(utcYear, utcMonth + 2, 0),
        ).getUTCDate();
        end = new Date(Date.UTC(utcYear, utcMonth + 1, nextLastDay - 1));
      } else {
        const prevLastDay = new Date(
          Date.UTC(utcYear, utcMonth, 0),
        ).getUTCDate();
        start = new Date(Date.UTC(utcYear, utcMonth - 1, prevLastDay - 1));
        end = new Date(Date.UTC(utcYear, utcMonth, penultimateDay - 1));
      }
    } else if (!Number.isNaN(Number(option)) && +option >= 1 && +option <= 28) {
      const refillDay = +option;

      if (utcDay === refillDay) {
        start = new Date(Date.UTC(utcYear, utcMonth, refillDay));
        end = new Date(Date.UTC(utcYear, utcMonth + 1, refillDay - 1));
      } else if (utcDay > refillDay) {
        start = new Date(Date.UTC(utcYear, utcMonth, refillDay));
        end = new Date(Date.UTC(utcYear, utcMonth + 1, refillDay - 1));
      } else {
        start = new Date(Date.UTC(utcYear, utcMonth - 1, refillDay));
        end = new Date(Date.UTC(utcYear, utcMonth, refillDay - 1));
      }
    } else {
      throw new BadRequestException('Invalid BudgetRefillDay option');
    }

    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(23, 59, 59, 999);

    return { start, end };
  }

  translate(language: string, identifiers: string[]) {
    const translationsJSON = fs.readFileSync(
      path.join(__dirname, '../../modules/translation/json/translation.json'),
      'utf8',
    );
    const translations = JSON.parse(translationsJSON);
    const expected = Object.keys(translations)
      .map((key) => {
        if (identifiers.includes(key)) {
          return { identifier: key, translation: translations[key] };
        }
        return null;
      })
      .filter(Boolean);
    if (!expected || expected.length === 0) return [];
    const requiredTranslations = expected.map((val) => ({
      identifier: val.identifier,
      translation: val.translation[0][language],
    }));
    return requiredTranslations;
  }

  translateCountries(language: string, identifiers: string[]) {
    const translationsJSON = fs.readFileSync(
      path.join(
        __dirname,
        '../../modules/translation/json/country-translation.json',
      ),
      'utf8',
    );
    const translations = JSON.parse(translationsJSON);
    const expected = Object.keys(translations)
      .map((key) => {
        if (identifiers.includes(key)) {
          return { identifier: key, translation: translations[key] };
        }
        return null;
      })
      .filter(Boolean);
    if (!expected || expected.length === 0) return [];
    const requiredTranslations = expected.map((val) => ({
      identifier: val.identifier,
      translation: val.translation[0][language],
    }));
    return requiredTranslations;
  }

  translateMessage(language: string, message: string) {
    if (!language || !message) return message;
    const translationsJSON = fs.readFileSync(
      path.join(__dirname, '../../modules/translation/json/translation.json'),
      'utf8',
    );
    const translations = JSON.parse(translationsJSON);
    return (
      translations[message.toLowerCase().replaceAll(' ', '_')]?.[0]?.[language]
        ?.name ?? message
    );
  }

  resolveRedisMapDates(
    mapping: Record<string, { date: string; carryOnEffect: boolean }>,
  ): Record<string, { date: string; carryOnEffect: boolean }> {
    const resolved: Record<string, { date: string; carryOnEffect: boolean }> =
      {};

    function findFinal(date: string): { date: string; carryOnEffect: boolean } {
      const seen = new Set<string>();
      let current = date;
      while (mapping[current] && !seen.has(current)) {
        seen.add(current);
        const next = mapping[current].date;
        if (!mapping[next]) return mapping[current];
        current = next;
      }
      return {
        date: current,
        carryOnEffect: mapping[current]?.carryOnEffect ?? false,
      };
    }

    const targets = new Set(Object.values(mapping).map((v) => v.date));

    for (const oldDate in mapping) {
      if (!targets.has(oldDate)) {
        resolved[oldDate] = findFinal(oldDate);
      }
    }

    return resolved;
  }

  toDate(d: Date | string | number): Date {
    return d instanceof Date ? d : new Date(d);
  }

  startOfUtcDay(d: Date): Date {
    return new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0),
    );
  }

  addUtcDays(d: Date, days: number): Date {
    const nd = new Date(d.getTime());
    nd.setUTCDate(nd.getUTCDate() + days);
    return nd;
  }

  startOfUtcMonth(d: Date): Date {
    return new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0, 0),
    );
  }

  addUtcMonths(d: Date, months: number): Date {
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth();
    const day = d.getUTCDate();
    const nd = new Date(Date.UTC(year, month + months, 1, 0, 0, 0, 0));
    // clamp day
    const lastDay = new Date(
      Date.UTC(nd.getUTCFullYear(), nd.getUTCMonth() + 1, 0),
    ).getUTCDate();
    nd.setUTCDate(Math.min(day, lastDay));
    return nd;
  }

  isBeforeUtc(a: Date, b: Date): boolean {
    return a.getTime() < b.getTime();
  }

  isSameUtcDay(a: Date, b: Date): boolean {
    return (
      a.getUTCFullYear() === b.getUTCFullYear() &&
      a.getUTCMonth() === b.getUTCMonth() &&
      a.getUTCDate() === b.getUTCDate()
    );
  }

  latestPerDay(points: Point[]): Map<string, Point> {
    const map = new Map<string, Point>();
    for (const p of points) {
      const key = this.dayKeyUTC(p.date);
      const prev = map.get(key);
      if (!prev || prev.date.getTime() < p.date.getTime()) map.set(key, p);
    }
    return map;
  }

  groupPerMonth(points: Point[]): Map<string, Point[]> {
    const map = new Map<string, Point[]>();
    for (const p of points) {
      const key = this.monthKeyUTC(p.date);
      const arr = map.get(key) ?? [];
      arr.push(p);
      map.set(key, arr);
    }
    // sort newest->oldest inside each month for easy capping; we will restore chronological later
    for (const [k, arr] of map)
      arr.sort((a, b) => b.date.getTime() - a.date.getTime());
    return map;
  }

  takeLatestMonthDayKeys(allDayKeysSortedAsc: string[]): string[] {
    const last = allDayKeysSortedAsc.at(-1);
    if (!last) return [];
    const d = this.toDate(last);
    const firstOfMonth = this.monthKeyUTC(d);
    return allDayKeysSortedAsc.filter((k) => k >= firstOfMonth);
  }

  locfFillDays(dayKeys: string[], dayMap: Map<string, Point>): Point[] {
    const out: Point[] = [];
    let last: Point | undefined;
    dayKeys.forEach((k, idx) => {
      const got = dayMap.get(k);
      if (got) {
        last = got;
        out.push(got);
      } else if (idx > 0 && last) {
        out.push({ date: new Date(k), value: last.value });
      }
      // else: first bucket missing -> leave empty (no fabricated first value)
    });
    return out;
  }

  // Build [from, to] for the selected range relative to "now" (UTC)
  buildWindowNow(range: RangeKey, now = new Date()): { from: Date; to: Date } {
    const to = now;
    const sod = this.startOfUtcDay(now);
    switch (range) {
      case '1D':
        return { from: sod, to };
      case '5D':
        return { from: this.addUtcDays(sod, -4), to };
      case '1M':
        return { from: this.addUtcMonths(sod, -1), to };
      case '1Y':
        return { from: this.addUtcMonths(sod, -12), to };
      case '5Y':
        return { from: this.addUtcMonths(sod, -60), to };
      default:
        return { from: new Date(0), to };
    }
  }

  // Widen the query "from" so we can LOCF the *first* bucket if needed
  widenForBackfill(range: RangeKey, from: Date): Date {
    switch (range) {
      case '1D':
        return this.addUtcDays(from, -30);
      case '5D':
        return this.addUtcDays(from, -60);
      case '1M':
        return this.addUtcMonths(from, -6);
      case '1Y':
        return this.addUtcMonths(from, -12);
      case '5Y':
        return this.addUtcMonths(from, -60);
      default:
        return from;
    }
  }

  // Keys for UTC calendar day/month
  dayKeyUTC(d: Date): string {
    return this.startOfUtcDay(d).toISOString();
  }

  monthKeyUTC(d: Date): string {
    return this.startOfUtcMonth(d).toISOString();
  }

  // Build day keys (inclusive) oldest -> newest
  buildDayKeys(from: Date, to: Date): string[] {
    const keys: string[] = [];
    for (
      let cur = this.startOfUtcDay(from);
      !this.isBeforeUtc(to, cur);
      cur = this.addUtcDays(cur, 1)
    ) {
      keys.push(cur.toISOString());
    }
    return keys;
  }

  // Build month keys (inclusive) oldest -> newest
  buildMonthKeys(from: Date, to: Date): string[] {
    const keys: string[] = [];
    for (
      let cur = this.startOfUtcMonth(from), end = this.startOfUtcMonth(to);
      !this.isBeforeUtc(end, cur);
      cur = this.addUtcMonths(cur, 1)
    ) {
      keys.push(cur.toISOString());
    }
    return keys;
  }

  private safeDateFromYapily(dateStr: string | null | undefined): number {
    if (!dateStr || typeof dateStr !== 'string' || !dateStr.trim()) {
      return 0;
    }
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) {
      return 0;
    }
    return parsed.getTime();
  }
}
