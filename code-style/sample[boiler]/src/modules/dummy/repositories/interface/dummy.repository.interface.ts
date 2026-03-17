import { IBaseRepository } from 'src/common/database/repositories/interfaces/base.interface';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { Dummy } from '../../entities/dummy.entity';

export const IDummyRepository = Symbol('IDummyRepository');

type DefaultEntity = Dummy;
export interface IDummyRepository<
  T = DefaultEntity,
> extends IBaseRepository<T> {
  findAll(paginationDto: PaginationDto): Promise<PagedList<Dummy>>;
}
