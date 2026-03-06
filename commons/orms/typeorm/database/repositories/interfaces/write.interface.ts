import {
  DeepPartial,
  DeleteResult,
  EntityManager,
  EntityTarget,
  FindOptionsWhere,
  UpdateResult,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { PaginationDto } from "../../dtos/pagination.dto";

export interface IWrite<T> {
  create(item: T): Promise<T>;
  bulkCreate(item: T[]): Promise<T[]>;
  bulkCreateWithTransaction<T>(
    item: T[],
    entity: EntityTarget<T>,
    transactionManager: EntityManager,
  ): Promise<T[]>;
  deleteWithTransaction<T>(
    where: FindOptionsWhere<T>,
    entity: EntityTarget<T>,
    transactionManager: EntityManager,
  ): Promise<DeleteResult>;
  update(
    conditions: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    updates: QueryDeepPartialEntity<T>,
  ): Promise<UpdateResult>;
  delete(where: FindOptionsWhere<T>): Promise<void>;
  softDelete(where: FindOptionsWhere<T>): Promise<void>;
  softDeleteWithTransaction(
    where: FindOptionsWhere<T>,
    entity: EntityTarget<T>,
    transactionManager: EntityManager,
  ): Promise<UpdateResult>;
  softDeleteWithRelations(entity: T): Promise<void>;
  restore(where: FindOptionsWhere<T>): Promise<UpdateResult>;

  restoreWithTransaction(
    where: FindOptionsWhere<T>,
    entity: EntityTarget<T>,
    transactionManager: EntityManager,
  ): Promise<UpdateResult>;

  getRowsByJsonbColumnLength(
    columnName: string,
    lengthToMatch: number,
    paginationDto: PaginationDto,
  ): Promise<T[]>;
  truncate(): Promise<void>;
  createWithTransaction<T>(
    item: DeepPartial<T>,
    entity: EntityTarget<T>,
    transactionManager: EntityManager,
  ): Promise<T>;
  updateWithTransaction<T>(
    conditions: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    updates: QueryDeepPartialEntity<T>,
    entity: EntityTarget<T>,
    transactionManager: EntityManager,
  ): Promise<void>;
  bulkUpdateWithIds(
    ids: number[],
    item: QueryDeepPartialEntity<T>,
  ): Promise<UpdateResult>;
  bulkUpdate(
    items: (QueryDeepPartialEntity<T> & { id: number })[],
    by: any,
  ): Promise<void>;
  bulkUpdateWithTransactionMultiBy(
    manager: EntityManager,
    items: QueryDeepPartialEntity<T>[],
    by: string | string[],
    batchSize?: number,
  ): Promise<void>;
  bulkUpdateWithTransaction(
    manager: EntityManager,
    items: QueryDeepPartialEntity<T>[],
    by: any,
    batchSize?: number,
  ): Promise<void>;
  updateWithOr(
    conditions: Record<string, any>,
    updates: QueryDeepPartialEntity<T>,
  ): Promise<UpdateResult>;
}
