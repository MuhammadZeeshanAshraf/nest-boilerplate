import { PaginationDto } from '../../../common/dtos/request/pagination.dto';
import { PagedList } from '../../../common/types/paged-list';
import { Dummy } from '../entities/dummy.entity';

export const IDummyService = Symbol('IDummyService');
export interface IDummyService {
  findAll(paginationDto: PaginationDto): Promise<PagedList<Dummy>>;
}
