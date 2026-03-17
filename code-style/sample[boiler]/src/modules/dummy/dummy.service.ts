import { Inject, Injectable } from '@nestjs/common';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';
import { IDummyService } from './interfaces/dummy.interface';
import { IDummyRepository } from './repositories/interface/dummy.repository.interface';

@Injectable()
export class DummyService implements IDummyService {
  constructor(
    @Inject(IDummyRepository)
    private readonly dummyRepository: IDummyRepository,
  ) {}

  findAll(paginationDto: PaginationDto) {
    return this.dummyRepository.findAll(paginationDto);
  }
}
