import {
  EntityManager,
  EntityTarget,
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { FindOptions } from '../../builder-pattern/find-options.builder';
import { PaginationDto } from "../../dtos/pagination.dto";
import { PagedList } from "../../types/paged-list";

export interface IRead<T> {
  getRepository<V>(entity: EntityTarget<V>): Repository<V>;
  find(
    whereOptions?: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    selectOption?: FindOptionsSelect<T>,
    orderOptions?: FindOptionsOrder<T>,
    relationOption?: FindOptionsRelations<T>,
    take?: number,
  ): Promise<T[]>;
  findWithPagination(
    paginationDto: PaginationDto,
    options?: FindOptions<T>,
  ): Promise<PagedList<T>>;
  findOne(
    whereOption: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    selectOption?: FindOptionsSelect<T>,
    relationOption?: FindOptionsRelations<T>,
  ): Promise<T>;
  findOneWithTransaction(
    transactionManager: EntityManager,
    entity: EntityTarget<T>,
    whereOption: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    selectOption?: FindOptionsSelect<T>,
    relationOption?: FindOptionsRelations<T>,
  ): Promise<T>;
  whereIn(whereOption: FindManyOptions<T>): Promise<T[]>;
  findOneWithBuilderOption(options?: FindOptions<T>): Promise<T>;
  findOneWithBuilderOptionAndTransaction(
    entity: EntityTarget<T>,
    transactionManager: EntityManager,
    options?: FindOptions<T>,
  ): Promise<T>;
  findManyWithBuilderOption(options?: FindOptions<T>): Promise<T[]>;
  findManyWithBuilderOptionAndTransaction(
    entity: EntityTarget<T>,
    transactionManager: EntityManager,
    options?: FindOptions<T>,
  ): Promise<T[]>;
  exist(whereOption: FindOptionsWhere<T>): Promise<T>;
  count(whereOption: FindOptionsWhere<T>): Promise<number>;
}
