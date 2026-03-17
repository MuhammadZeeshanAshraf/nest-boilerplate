import { Injectable } from '@nestjs/common';
import { HelpArticle } from '../../../../modules/help/entities/help-article.entity';
import { Help } from '../../../../modules/help/entities/help.entity';
import dataSource from '../../dbConfig';

@Injectable()
export class HelpSeed {
  async seed() {
    const articles = [
      { article: 'http://somearticle.com', heading: 'Heading1' },
      { article: 'http://somearticle.com', heading: 'Heading1' },
      { article: 'http://somearticle.com', heading: 'Heading1' },
      { article: 'http://somearticle.com', heading: 'Heading1' },
      { article: 'http://somearticle.com', heading: 'Heading1' },
      { article: 'http://somearticle.com', heading: 'Heading1' },
    ];
    const helps = [
      { title: 'Title1', category: 'Category1' },
      { title: 'Title2', category: 'Category2' },
      { title: 'Title3', category: 'Category3' },
    ];
    const helpRepo = dataSource.getRepository(Help);
    const articleRepo = dataSource.getRepository(HelpArticle);

    if (helps.length > 0) {
      const resp = await helpRepo.save(helps);
      const articlesDto = resp.flatMap((hlp) =>
        articles.map((art) => ({
          article: art.article,
          heading: art.heading,
          titleId: hlp.id,
        })),
      );
      await articleRepo.save(articlesDto);
    }
  }
}
