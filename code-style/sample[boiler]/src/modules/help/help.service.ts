import { Inject, Injectable } from '@nestjs/common';
import { FindOptionsBuilder } from '../../common/database/builder-pattern/find-options.builder';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';
import { Help } from './entities/help.entity';
import { IHelpService } from './interfaces/help.interface';
import { IHelpRepository } from './repositories/interface/help.repository.interface';

@Injectable()
export class HelpService implements IHelpService {
  constructor(
    @Inject(IHelpRepository)
    private readonly helpRepository: IHelpRepository,
  ) {}

  findAll(paginationDto: PaginationDto) {
    return this.helpRepository.findAll(paginationDto);
  }

  findOne(id: number) {
    const findOptions = new FindOptionsBuilder<Help>()
      .where({
        id,
      })
      .relations({
        articles: true,
      })
      .build();
    return this.helpRepository.findOneWithBuilderOption(findOptions);
  }
}
