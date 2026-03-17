/* eslint-disable @typescript-eslint/no-explicit-any */
import { BadRequestException } from '@nestjs/common';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import {
  DeepPartial,
  DeleteResult,
  EntityManager,
  EntityTarget,
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  In,
  IsNull,
  Repository,
  UpdateResult,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { FindOptions } from '../../builder-pattern/find-options.builder';
import { IRead } from '../interfaces/read.interface';
import { IWrite } from '../interfaces/write.interface';

export abstract class BaseRepository<T> implements IWrite<T>, IRead<T> {
  public readonly tableName: string;

  constructor(public repository: Repository<T>) {
    this.tableName = this.repository.metadata.tableName;
  }

  getRepository<V>(entity: EntityTarget<V>): Repository<V> {
    return this.repository.manager.getRepository(entity);
  }

  findOneWithBuilderOptionAndTransaction(
    entity: EntityTarget<T>,
    transactionManager: EntityManager,
    options?: FindOptions<T>,
  ): Promise<T> {
    try {
      return transactionManager.getRepository(entity).findOne(options);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  findManyWithBuilderOptionAndTransaction(
    entity: EntityTarget<T>,
    transactionManager: EntityManager,
    options?: FindOptions<T>,
  ): Promise<T[]> {
    try {
      return transactionManager.getRepository(entity).find(options);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  private normalizeNulls(
    whereOption: any,
  ): FindOptionsWhere<T> | FindOptionsWhere<T>[] {
    const normalizeOne = (option: FindOptionsWhere<T>): FindOptionsWhere<T> =>
      Object.fromEntries(
        Object.entries(option).map(([key, value]) => [
          key,
          value === null ? IsNull() : value,
        ]),
      ) as FindOptionsWhere<T>;

    return Array.isArray(whereOption)
      ? whereOption.map((opt) => normalizeOne(opt))
      : normalizeOne(whereOption);
  }

  count(whereOption: FindOptionsWhere<T>): Promise<number> {
    const normalized = this.normalizeNulls(whereOption);
    return this.repository.count({ where: normalized });
  }

  truncate(): Promise<void> {
    return this.repository.clear();
  }

  async whereIn(whereOption: FindManyOptions<T>): Promise<T[]> {
    try {
      const normalized = this.normalizeNulls(whereOption.where);
      return await this.repository.find({
        where: normalized,
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findOne(
    whereOption: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    selectOption?: FindOptionsSelect<T>,
    relationOption?: FindOptionsRelations<T>,
  ): Promise<T> {
    try {
      const normalized = this.normalizeNulls(whereOption);
      return await this.repository.findOne({
        select: selectOption || {},
        where: normalized,
        relations: relationOption,
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findOneWithTransaction(
    manager: EntityManager,
    entity: EntityTarget<T>,
    whereOption: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    selectOption?: FindOptionsSelect<T>,
    relationOption?: FindOptionsRelations<T>,
  ): Promise<T> {
    try {
      const normalized = this.normalizeNulls(whereOption);
      return await manager.getRepository(entity).findOne({
        select: selectOption || {},
        where: normalized,
        relations: relationOption,
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async exist(whereOption: FindOptionsWhere<T>): Promise<T> {
    return this.repository.findOneBy(whereOption);
  }

  async create(item: T): Promise<T> {
    try {
      return await this.repository.save(this.repository.create(item));
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async createWithTransaction<T>(
    item: DeepPartial<T>,
    entity: EntityTarget<T>,
    transactionManager: EntityManager,
  ): Promise<T> {
    try {
      return await transactionManager.getRepository(entity).save(item);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async bulkCreate(item: T[]): Promise<T[]> {
    try {
      if (!item.length) return [];
      return await this.repository.save(this.repository.create(item));
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async bulkUpdateWithIds(
    ids: number[],
    item: QueryDeepPartialEntity<T>,
  ): Promise<UpdateResult> {
    try {
      return await this.repository.update({ id: In(ids) } as any, item);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Performs a bulk update of entities in batches using raw SQL queries for improved performance.
   *
   * @param items - An array of partial entity objects to update. Each object must include the `by` field (e.g., `id`) with a unique value.
   * @param by - The property name to use as the unique identifier for matching rows to update.
   *             This field is used in the `CASE` statements to conditionally update each column.
   *             It must be a key in each `item` and should resolve to a `number` or `string`.
   * @param batchSize - (Optional) The number of items to process per batch. Default is 20.
   *
   * Example:
   * ```ts
   * await bulkUpdate([
   *   { id: 1, name: 'Alice' },
   *   { id: 2, name: 'Bob' }
   * ], 'id');
   * ```
   * Note:
   * `It skips reference by, and also skips undefined values`
   */
  async bulkUpdate(
    items: QueryDeepPartialEntity<T>[],
    by: any,
    batchSize: number = 20,
  ): Promise<void> {
    if (items.length === 0) return;
    try {
      const itemLength = items.length;
      const columnMap = new Map<string, string>();

      this.repository.metadata.columns.forEach((col) => {
        columnMap.set(col.propertyName, col.databaseName);
      });
      const referenceBy = columnMap.get(by);
      if (!referenceBy) {
        throw new BadRequestException(`Invalid reference for bulk update${by}`);
      }
      const queryColumnMap: Map<
        string,
        Array<{ identity: any; val: any }>
      > = new Map();
      const identities: Set<string | boolean> = new Set();
      for (let i = 0; i < itemLength; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        for (const item of batch) {
          const identity = this.formatValue(item[by]);
          if (!identity) continue;
          identities.add(identity);

          for (const [col, val] of Object.entries(item)) {
            if (!columnMap.has(col) || col === by || val === undefined)
              continue;

            const dbCol = columnMap.get(col)!;

            if (!queryColumnMap.has(dbCol)) {
              queryColumnMap.set(dbCol, []);
            }

            queryColumnMap
              .get(dbCol)!
              .push({ identity, val: this.formatValue(val, true) });
          }
        }
      }
      const params = [];
      let paramIndex = 0;
      const cases = Array.from(queryColumnMap, ([key, val]) => {
        const cases = val.map((v) => {
          paramIndex++;

          params.push(v.val);

          return ` WHEN ${v.identity} THEN $${paramIndex}`;
        });
        return `${key} = CASE "${referenceBy}" ${cases.join(' ')} ELSE ${key} END`;
      });
      if (cases.length > 0) {
        const query = `UPDATE "${this.repository.metadata.tableName}" SET ${cases.join(', ')} WHERE "${referenceBy}" IN (${Array.from(identities.values()).join(',')})`;
        await this.repository.query(query, params);
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async bulkUpdateWithTransaction(
    manager: EntityManager,
    items: QueryDeepPartialEntity<T>[],
    by: string,
    batchSize = 20,
  ): Promise<void> {
    if (items.length === 0) return;
    try {
      const itemLength = items.length;
      const columnMap = new Map<string, string>();
      this.repository.metadata.columns.forEach((col) => {
        columnMap.set(col.propertyName, col.databaseName);
      });
      const referenceBy = columnMap.get(by);
      if (!referenceBy)
        throw new BadRequestException(
          `Invalid reference for bulk update ${by}`,
        );

      const queryColumnMap: Map<
        string,
        Array<{ identity: any; val: any }>
      > = new Map();
      const identities = [];

      for (let i = 0; i < itemLength; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        for (const item of batch) {
          const identity = this.formatValue(item[by]);
          identities.push(identity);
          for (const [col, val] of Object.entries(item)) {
            if (!columnMap.has(col) || col === by || val === undefined)
              continue;
            const dbCol = columnMap.get(col)!;
            if (!queryColumnMap.has(dbCol)) queryColumnMap.set(dbCol, []);
            queryColumnMap
              .get(dbCol)!
              .push({ identity, val: this.formatValue(val, true) });
          }
        }
      }

      const params = [];
      let paramIndex = 0;
      const cases = Array.from(queryColumnMap, ([key, val]) => {
        const caseStatements = val.map((v) => {
          params.push(v.val);
          paramIndex++;
          return `WHEN ${v.identity} THEN $${paramIndex}`;
        });
        return `"${key}" = CASE "${referenceBy}" ${caseStatements.join(' ')} ELSE "${key}" END`;
      });

      const query = `UPDATE "${this.repository.metadata.tableName}" SET ${cases.join(', ')} WHERE "${referenceBy}" IN (${identities.join(',')})`;
      await manager.query(query, params);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async bulkUpdateWithTransactionMultiBy(
    manager: EntityManager,
    items: QueryDeepPartialEntity<T>[],
    by: string | string[],
    batchSize = 20,
  ): Promise<void> {
    if (items.length === 0) return;

    try {
      const itemLength = items.length;
      const columnMap = new Map<string, string>();
      this.repository.metadata.columns.forEach((col) => {
        columnMap.set(col.propertyName, col.databaseName);
      });

      const byColumns = Array.isArray(by) ? by : [by];
      const referenceColumns = byColumns.map((b) => columnMap.get(b));
      if (referenceColumns.some((c) => !c))
        throw new BadRequestException(
          `Invalid reference for bulk update ${by}`,
        );

      const queryColumnMap: Map<
        string,
        Array<{ identity: any; val: any }>
      > = new Map();
      const identities = [];

      for (let i = 0; i < itemLength; i += batchSize) {
        const batch = items.slice(i, i + batchSize);

        for (const item of batch) {
          const identityParts = byColumns.map((b) => this.formatValue(item[b]));
          const identity = `(${identityParts.join(',')})`;
          identities.push(identity);

          for (const [col, val] of Object.entries(item)) {
            if (
              !columnMap.has(col) ||
              byColumns.includes(col) ||
              val === undefined
            )
              continue;
            const dbCol = columnMap.get(col)!;
            if (!queryColumnMap.has(dbCol)) queryColumnMap.set(dbCol, []);
            queryColumnMap
              .get(dbCol)!
              .push({ identity, val: this.formatValue(val, true) });
          }
        }
      }

      const params = [];
      let paramIndex = 0;

      const cases = Array.from(queryColumnMap, ([key, val]) => {
        const caseClauses = val.map((v) => {
          params.push(v.val);
          paramIndex++;
          return ` WHEN ROW(${v.identity}) THEN $${paramIndex}`;
        });
        const referenceExpr = `ROW(${referenceColumns.map((c) => `"${c}"`).join(',')})`;
        return `${key} = CASE ${referenceExpr} ${caseClauses.join(' ')} ELSE ${key} END`;
      });

      const whereClause = `(${referenceColumns.map((c) => `"${c}"`).join(',')})`;
      const query = `UPDATE "${this.repository.metadata.tableName}" SET ${cases.join(', ')} WHERE ${whereClause} IN (${identities.join(',')})`;

      await manager.query(query, params);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  private formatValue(val: any, param?: boolean): string | boolean {
    if (val instanceof Date)
      return param ? `${val.toISOString()}` : `'${val.toISOString()}'`;
    if (typeof val === 'string')
      return param
        ? `${val.replace(/'/g, "''")}`
        : `'${val.replace(/'/g, "''")}'`;
    if (typeof val === 'boolean') {
      if (param) {
        return val;
      }
      return val ? 'TRUE' : 'FALSE';
    }
    return val;
  }

  async bulkCreateWithTransaction<T>(
    item: T[],
    entity: EntityTarget<T>,
    transactionManager: EntityManager,
  ): Promise<T[]> {
    try {
      return await transactionManager.getRepository(entity).save(item);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async softDeleteWithTransaction<T>(
    where: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    entity: EntityTarget<T>,
    transactionManager: EntityManager,
  ): Promise<UpdateResult> {
    try {
      const normalized = this.normalizeNulls(where);

      const repo = transactionManager.getRepository(entity);
      return await repo.softDelete(normalized as any);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async deleteWithTransaction<T>(
    where: FindOptionsWhere<T>,
    entity: EntityTarget<T>,
    transactionManager: EntityManager,
  ): Promise<DeleteResult> {
    try {
      const normalized = this.normalizeNulls(where);
      const repo = transactionManager.getRepository(entity);
      return await repo.delete(normalized as any);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async update(
    conditions: FindOptionsWhere<T>,
    updates: QueryDeepPartialEntity<T>,
  ): Promise<UpdateResult> {
    const columns = this.repository.metadata.columns.map(
      (col) => col.propertyName,
    );

    const validUpdates: QueryDeepPartialEntity<T> = Object.keys(updates)
      .filter((key) => columns.includes(key))
      .reduce((obj, key) => {
        (obj as any)[key] = (updates as any)[key];
        return obj;
      }, {} as QueryDeepPartialEntity<T>);

    return this.repository.update(conditions, validUpdates);
  }

  async updateWithOr(
    conditions: Record<string, unknown>,
    updates: QueryDeepPartialEntity<T>,
  ): Promise<UpdateResult> {
    const queryBuilder = this.repository
      .createQueryBuilder()
      .update(this.repository.target)
      .set(updates);
    Object.entries(conditions).forEach(([key, value]) => {
      queryBuilder.orWhere(`${key} = :${key}`, { [key]: value });
    });
    return queryBuilder.execute();
  }

  async updateWithTransaction<T>(
    conditions: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    updates: QueryDeepPartialEntity<T>,
    entity: EntityTarget<T>,
    transactionManager: EntityManager,
  ): Promise<void> {
    try {
      const repo = transactionManager.getRepository(entity);

      const columns = repo.metadata.columns.map((col) => col.propertyName);

      const validUpdates: QueryDeepPartialEntity<T> = Object.keys(updates)
        .filter((key) => columns.includes(key))
        .reduce((obj, key) => {
          (obj as any)[key] = (updates as any)[key];
          return obj;
        }, {} as QueryDeepPartialEntity<T>);
      await repo.update(conditions, validUpdates);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async delete(where: FindOptionsWhere<T>): Promise<void> {
    const normalized = this.normalizeNulls(where);
    await this.repository.delete(normalized as any);
  }

  async softDelete(where: FindOptionsWhere<T>): Promise<void> {
    const normalized = this.normalizeNulls(where);
    await this.repository.softDelete(normalized as any);
  }

  async softDeleteWithRelations(entity: T): Promise<void> {
    await this.repository.softRemove(entity);
  }

  async restoreWithTransaction(
    where: FindOptionsWhere<T>,
    entity: EntityTarget<T>,
    transactionManager: EntityManager,
  ): Promise<UpdateResult> {
    const normalized = this.normalizeNulls(where);

    const repo = transactionManager.getRepository(entity);
    return repo.restore(normalized as any);
  }

  async restore(where: FindOptionsWhere<T>): Promise<UpdateResult> {
    const normalized = this.normalizeNulls(where);
    return this.repository.restore(normalized as any);
  }

  async find(
    whereOption?: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    selectOption?: FindOptionsSelect<T>,
    orderOptions?: FindOptionsOrder<T>,
    relationOption?: FindOptionsRelations<T>,
    take?: number,
  ): Promise<T[]> {
    try {
      const normalized = this.normalizeNulls(whereOption);
      return await this.repository.find({
        select: selectOption,
        order: orderOptions,
        where: normalized,
        relations: relationOption,
        take,
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findWithBatch(
    skip: number,
    take: number,
    whereOption?: FindOptionsWhere<T>,
    selectOption?: FindOptionsSelect<T>,
    orderOptions?: FindOptionsOrder<T>,
    relationOption?: FindOptionsRelations<T>,
  ): Promise<T[]> {
    try {
      const normalized = this.normalizeNulls(whereOption);
      return await this.repository.find({
        select: selectOption,
        order: orderOptions,
        where: normalized,
        relations: relationOption,
        take,
        skip,
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findWithPagination(
    paginationDto: PaginationDto,
    options?: FindOptions<T>,
  ): Promise<PagedList<T>> {
    const { page, take } = paginationDto;
    const skip = (page - 1) * take;
    const [items, count] = await this.repository.findAndCount({
      ...options,
      take,
      skip,
    });
    return new PagedList<T>(items, count, take, page);
  }

  async findWithPaginationWithoutCount(
    paginationDto: PaginationDto,
    options?: FindOptions<T>,
  ): Promise<PagedList<T>> {
    try {
      const { page, take } = paginationDto;
      const skip = (page - 1) * take;
      const items = await this.repository.find({
        ...options,
        take,
        skip,
      });
      return new PagedList<T>(items, 1000, take, page);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findManyWithBuilderOption(options?: FindOptions<T>): Promise<T[]> {
    return this.repository.find({
      ...options,
    });
  }

  async findOneWithBuilderOption(options?: FindOptions<T>): Promise<T> {
    return this.repository.findOne({
      ...options,
    });
  }

  async updateFieldBasedOnConditionsWithRawApproach(
    tableName: string,
    fieldToUpdate: string,
    updateValue: any,
    whereConditions: string,
  ) {
    const query = `
          UPDATE ${tableName}
          SET ${fieldToUpdate} = $1
          WHERE ${whereConditions}
        `;

    await this.repository.query(query, [updateValue]);
  }

  async getRowsByJsonbColumnLength(
    columnName: string,
    lengthToMatch: number,
    paginationDto: PaginationDto,
  ): Promise<T[]> {
    const { page, take } = paginationDto;
    const skip = (page - 1) * take;
    return this.repository
      .createQueryBuilder(`${this.tableName}`)
      .where(
        `jsonb_array_length(${this.tableName}.${columnName}) = ${lengthToMatch}`,
      )
      .skip(skip)
      .take(take)
      .getMany();
  }

  async selectNotValidIds(
    tableName: string,
    selectColumns: string[],
    subquery: string,
    subqueryAlias: string,
    joinConditions: string,
    whereConditions: string,
  ) {
    const selectColumnsStr = selectColumns.join(', ');
    const query = `
          SELECT ${selectColumnsStr}
          FROM (
            ${subquery}
          ) AS ${subqueryAlias}
          LEFT JOIN ${tableName} ON ${joinConditions}
          WHERE ${whereConditions}
        `;
    const result = await this.repository.query(query);
    return result;
  }
}
