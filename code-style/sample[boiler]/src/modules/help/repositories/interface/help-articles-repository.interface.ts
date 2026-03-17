import { IBaseRepository } from 'src/common/database/repositories/interfaces/base.interface';
import { HelpArticle } from '../../entities/help-article.entity';

export const IHelpArticleRepository = Symbol('IHelpArticleRepository');

type DefaultEntity = HelpArticle;
export interface IHelpArticleRepository<T = DefaultEntity>
  extends IBaseRepository<T> {
  findAllByTitleId(titleId: number): Promise<HelpArticle[]>;
}
