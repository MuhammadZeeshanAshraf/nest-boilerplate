import { Logger } from "@nestjs/common";
import { EntityManager, QueryRunner } from "typeorm";
import { IsolationLevel } from "typeorm/driver/types/IsolationLevel";

const DEFAULT_ISOLATION_LEVEL: IsolationLevel = "READ COMMITTED";

export const DB_TRANSACTION_FACTORY = "DB_TRANSACTION_FACTORY";

export interface ITransactionRunner {
  start(): Promise<void>;
  commitTransaction(): Promise<void>;
  rollbackTransaction(): Promise<void>;
  release(): Promise<void>;
  end(): Promise<void>;
  get manager(): EntityManager;
  isTransactionActive(): Promise<boolean>;
}

export class TransactionRunner implements ITransactionRunner {
  private readonly logger = new Logger(TransactionRunner.name);
  private isReleased = false;

  constructor(private readonly queryRunner: QueryRunner) {}

  public async start(
    isolationLevel: IsolationLevel = DEFAULT_ISOLATION_LEVEL,
  ): Promise<void> {
    try {
      if (this.isReleased) {
        throw new Error("Transaction runner has already been released");
      }

      if (this.queryRunner.isTransactionActive) {
        this.logger.warn("Transaction is already active");
        return;
      }

      await this.queryRunner.startTransaction(isolationLevel);
      this.logger.debug("Transaction started successfully");
    } catch (error) {
      this.logger.error("Failed to start transaction:", error);
      throw error;
    }
  }

  public async commitTransaction(): Promise<void> {
    try {
      if (this.isReleased) {
        this.logger.warn("Attempting to commit on released transaction runner");
        return;
      }

      if (!this.queryRunner.isTransactionActive) {
        this.logger.warn("No active transaction to commit");
        return;
      }

      await this.queryRunner.commitTransaction();
      this.logger.debug("Transaction committed successfully");
    } catch (error) {
      this.logger.error("Failed to commit transaction:", error);
      throw error;
    }
  }

  public async rollbackTransaction(): Promise<void> {
    try {
      if (this.isReleased) {
        this.logger.warn(
          "Attempting to rollback on released transaction runner",
        );
        return;
      }

      if (this.queryRunner.isTransactionActive) {
        await this.queryRunner.rollbackTransaction();
        this.logger.debug("Transaction rolled back successfully");
      } else {
        this.logger.warn("No active transaction to rollback");
      }
    } catch (error) {
      this.logger.error("Failed to rollback transaction:", error);
      // Don't throw here to ensure cleanup continues
    }
  }

  public async release(): Promise<void> {
    try {
      if (this.isReleased) {
        this.logger.warn("Transaction runner already released");
        return;
      }

      await this.queryRunner.release();
      this.isReleased = true;
      this.logger.debug("Query runner released successfully");
    } catch (error) {
      this.logger.error("Failed to release query runner:", error);
      this.isReleased = true; // Mark as released even if error occurred
      throw error;
    }
  }

  public async end(): Promise<void> {
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
    if (this.isReleased) {
      throw new Error("Cannot access manager on released transaction runner");
    }
    return this.queryRunner.manager;
  }

  public async isTransactionActive(): Promise<boolean> {
    if (this.isReleased) {
      return false;
    }
    return this.queryRunner.isTransactionActive;
  }
}
