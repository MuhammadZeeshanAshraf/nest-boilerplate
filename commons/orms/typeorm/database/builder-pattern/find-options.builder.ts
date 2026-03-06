import {
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
} from 'typeorm';

export interface FindOptions<T> {
  select: FindOptionsSelect<T>;
  where: FindOptionsWhere<T>;
  relations: FindOptionsRelations<T>;
  order: FindOptionsOrder<T>;
}

export class FindOptionsBuilder<T> {
  private selectOption: FindOptionsSelect<T> = {};

  private whereOption: FindOptionsWhere<T> = {};

  private relationOption: FindOptionsRelations<T> = {};

  private orderOptions: FindOptionsOrder<T> = {};

  select(options: FindOptionsSelect<T>): FindOptionsBuilder<T> {
    this.selectOption = options;
    return this;
  }

  where(options: FindOptionsWhere<T>): FindOptionsBuilder<T> {
    this.whereOption = options;
    return this;
  }

  relations(options: FindOptionsRelations<T>): FindOptionsBuilder<T> {
    this.relationOption = options;
    return this;
  }

  order(options: FindOptionsOrder<T>): FindOptionsBuilder<T> {
    this.orderOptions = options;
    return this;
  }

  build(): FindOptions<T> {
    return {
      select: this.selectOption,
      where: this.whereOption,
      relations: this.relationOption,
      order: this.orderOptions,
    };
  }
}
