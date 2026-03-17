import { AutoMap } from '@automapper/classes';
import { Column, Entity } from 'typeorm';
import { TABLES } from '../../../common/database/tables';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity(TABLES.DUMMY, { schema: 'public' })
export class Dummy extends BaseEntity {
  @AutoMap()
  @Column('character varying')
  dummy: string;
}
