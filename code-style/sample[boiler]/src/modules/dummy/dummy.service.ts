import { Inject, Injectable } from '@nestjs/common';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';
import { IDummyService } from './interfaces/dummy.interface';
import { IDummyRepository } from './repositories/interface/dummy.repository.interface';
import { CreateDummyDto } from './dto/request/create-dummy.dto';
import { Dummy } from './entities/dummy.entity';

@Injectable()
export class DummyService implements IDummyService {
  constructor(
    @Inject(IDummyRepository)
    private readonly dummyRepository: IDummyRepository,
    @InjectMapper() private readonly mapper: Mapper
  ) {}

  findAll(paginationDto: PaginationDto) {
    return this.dummyRepository.findAll(paginationDto);
  }

  create(data:CreateDummyDto){
    const mappedDummy = this.mapper.map(data, CreateDummyDto, Dummy);
    return this.dummyRepository.create(mappedDummy);
  }
}
