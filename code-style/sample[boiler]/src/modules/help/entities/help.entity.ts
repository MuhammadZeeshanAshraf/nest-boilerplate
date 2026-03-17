import { AutoMap } from '@automapper/classes';
import { Column, Entity, OneToMany } from 'typeorm';
import { TABLES } from '../../../common/database/tables';
import { BaseEntity } from '../../../common/entities/base.entity';
import { HelpArticle } from './help-article.entity';

@Entity(TABLES.HELP, { schema: 'public' })
export class Help extends BaseEntity {
  @AutoMap()
  @Column('character varying', { name: 'title', nullable: false })
  title: string;

  @AutoMap()
  @Column('character varying', { name: 'category', nullable: false })
  category: string;

  @OneToMany(() => HelpArticle, (articles) => articles.help, {
    cascade: ['remove', 'soft-remove'],
  })
  articles: HelpArticle[];
}
