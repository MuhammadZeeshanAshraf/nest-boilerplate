import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';
import { AppLog } from '../../../modules/app-log/entities/app-log.entity';
import dataSource from '../dbConfig';

const DEFAULT_ISOLATION_LEVEL: IsolationLevel = 'READ COMMITTED';
const DEFAULT_TIMEOUT_MS = 60000 * 5;
export interface ITransactionRunner {
  start(info: any, isolationLevel?: IsolationLevel): Promise<void>;
  end(): Promise<void>;
}

export class TransactionRunner implements ITransactionRunner {
  private timeoutHandle?: NodeJS.Timeout;

  constructor(private readonly queryRunner: QueryRunner) {}

  public async start(
    info: any,
    isolationLevel: IsolationLevel = DEFAULT_ISOLATION_LEVEL,
  ): Promise<void> {
    if (this.queryRunner.isTransactionActive) return;
    // const repo = dataSource.getRepository(AppLog);
    // await repo.save({
    //   logType: 'transaction-start',
    //   logData: info,
    //   logId: null,
    // });
    await this.queryRunner.startTransaction(isolationLevel);
    this.timeoutHandle = setTimeout(async () => {
      if (this.queryRunner.isTransactionActive) {
        await this.rollbackTransaction();
        const repo = dataSource.getRepository(AppLog);
        await repo.save({
          logType: 'transaction-timeout',
          logData: info,
          logId: null,
        });
      }
    }, DEFAULT_TIMEOUT_MS);
  }

  public async isTransactionActive(): Promise<boolean> {
    return this.queryRunner.isTransactionActive;
  }

  public async end(): Promise<void> {
    clearTimeout(this.timeoutHandle);
    try {
      await this.commitTransaction();
    } catch (error) {
      await this.rollbackTransaction();
      throw error;
    } finally {
      await this.release();
    }
  }

  get manager(): EntityManager {
    return this.queryRunner.manager;
  }

  public async commitTransaction(): Promise<void> {
    if (this.queryRunner.isTransactionActive) {
      await this.queryRunner.commitTransaction();
    }
  }

  public async rollbackTransaction(): Promise<void> {
    if (this.queryRunner.isTransactionActive) {
      await this.queryRunner.rollbackTransaction();
      await this.queryRunner.release();
    }
  }

  public async release(): Promise<void> {
    await this.queryRunner.release();
  }
}

@Injectable()
export class DbTransactionFactory {
  constructor(private readonly dataSource: DataSource) {}

  async transactionRunner(info: any): Promise<TransactionRunner> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    const transactionRunner = new TransactionRunner(queryRunner);
    return transactionRunner;
  }
}
