import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ORDER_BY } from 'src/common/constants/enums';
import { FindOptionsBuilder } from 'src/common/database/builder-pattern/find-options.builder';
import { BaseRepository } from 'src/common/database/repositories/base/base.repository';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { Repository } from 'typeorm';
import { Help } from '../entities/help.entity';
import { IHelpRepository } from './interface/help.repository.interface';

@Injectable()
export class HelpRepository
  extends BaseRepository<Help>
  implements IHelpRepository
{
  constructor(
    @InjectRepository(Help)
    public readonly repository: Repository<Help>,
  ) {
    super(repository);
  }

  async findAll(paginationDto: PaginationDto): Promise<PagedList<Help>> {
    const findOption = new FindOptionsBuilder<Help>()
      .where({
        deletedAt: null,
      })
      .order({ id: ORDER_BY.DESC })
      .build();
    return this.findWithPagination(paginationDto, findOption);
  }
}
