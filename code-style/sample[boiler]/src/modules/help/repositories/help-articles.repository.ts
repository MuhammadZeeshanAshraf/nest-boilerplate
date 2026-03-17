import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ORDER_BY } from 'src/common/constants/enums';
import { FindOptionsBuilder } from 'src/common/database/builder-pattern/find-options.builder';
import { BaseRepository } from 'src/common/database/repositories/base/base.repository';
import { Repository } from 'typeorm';
import { HelpArticle } from '../entities/help-article.entity';
import { IHelpArticleRepository } from './interface/help-articles-repository.interface';

@Injectable()
export class HelpArticleRepository
  extends BaseRepository<HelpArticle>
  implements IHelpArticleRepository
{
  constructor(
    @InjectRepository(HelpArticle)
    public readonly repository: Repository<HelpArticle>,
  ) {
    super(repository);
  }

  async findAllByTitleId(titleId: number): Promise<HelpArticle[]> {
    const findOption = new FindOptionsBuilder<HelpArticle>()
      .where({
        titleId,
      })
      .order({ id: ORDER_BY.DESC })
      .build();

    return this.findManyWithBuilderOption(findOption);
  }
}
