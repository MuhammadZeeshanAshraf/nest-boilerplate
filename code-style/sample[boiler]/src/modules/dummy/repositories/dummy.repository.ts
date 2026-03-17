import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsBuilder } from 'src/common/database/builder-pattern/find-options.builder';
import { BaseRepository } from 'src/common/database/repositories/base/base.repository';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { Repository } from 'typeorm';
import { Dummy } from '../entities/dummy.entity';
import { IDummyRepository } from './interface/dummy.repository.interface';

@Injectable()
export class DummyRepository
  extends BaseRepository<Dummy>
  implements IDummyRepository
{
  constructor(
    @InjectRepository(Dummy)
    public readonly repository: Repository<Dummy>,
  ) {
    super(repository);
  }

  async findAll(paginationDto: PaginationDto): Promise<PagedList<Dummy>> {
    const findOption = new FindOptionsBuilder<Dummy>()
      .where({
        deletedAt: null,
      })
      .order({ id: 'DESC' })
      .build();
    return this.findWithPagination(paginationDto, findOption);
  }
}
