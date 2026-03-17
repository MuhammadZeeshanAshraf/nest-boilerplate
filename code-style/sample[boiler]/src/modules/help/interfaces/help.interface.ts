import { PaginationDto } from '../../../common/dtos/request/pagination.dto';
import { PagedList } from '../../../common/types/paged-list';
import { Help } from '../entities/help.entity';

export const IHelpService = Symbol('IHelpService');
export interface IHelpService {
  findAll(paginationDto: PaginationDto): Promise<PagedList<Help>>;
  findOne(id: number): Promise<Help>;
}
