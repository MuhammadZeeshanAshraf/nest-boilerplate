import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';

const DEFAULT_ISOLATION_LEVEL: IsolationLevel = 'READ COMMITTED';
const DEFAULT_TIMEOUT_MS = 60000 * 5;
export interface ITransactionRunner {
  start(isolationLevel?: IsolationLevel): Promise<void>;
  end(): Promise<void>;
}

export class TransactionRunner implements ITransactionRunner {
  private timeoutHandle?: NodeJS.Timeout;

  constructor(private readonly queryRunner: QueryRunner) {}

  public async start(
    isolationLevel: IsolationLevel = DEFAULT_ISOLATION_LEVEL,
  ): Promise<void> {
    if (this.queryRunner.isTransactionActive) return;
    await this.queryRunner.startTransaction(isolationLevel);
    this.timeoutHandle = setTimeout(async () => {
      if (this.queryRunner.isTransactionActive) {
        await this.rollbackTransaction();
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

  async transactionRunner(): Promise<TransactionRunner> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    const transactionRunner = new TransactionRunner(queryRunner);
    return transactionRunner;
  }
}
