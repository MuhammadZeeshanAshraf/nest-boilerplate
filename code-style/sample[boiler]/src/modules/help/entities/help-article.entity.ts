import { AutoMap } from '@automapper/classes';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TABLES } from '../../../common/database/tables';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Help } from './help.entity';

@Entity(TABLES.HELP_ARTICLES, { schema: 'public' })
export class HelpArticle extends BaseEntity {
  @AutoMap()
  @Column('integer', { name: 'title_id', nullable: false })
  titleId: number;

  @AutoMap()
  @Column('character varying', { name: 'heading', nullable: false })
  heading: string;

  @AutoMap()
  @Column('character varying', { name: 'article', nullable: false })
  article: string;

  @ManyToOne(() => Help, (help) => help.articles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'title_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'help_articles_help_id_fk',
  })
  help: Help;
}
