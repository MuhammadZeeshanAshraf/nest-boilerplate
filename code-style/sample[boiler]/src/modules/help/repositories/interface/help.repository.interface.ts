import { IBaseRepository } from 'src/common/database/repositories/interfaces/base.interface';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { Help } from '../../entities/help.entity';

export const IHelpRepository = Symbol('IHelpRepository');

type DefaultEntity = Help;
export interface IHelpRepository<T = DefaultEntity> extends IBaseRepository<T> {
  findAll(paginationDto: PaginationDto): Promise<PagedList<Help>>;
}
