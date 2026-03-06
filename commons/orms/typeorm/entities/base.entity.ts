import { AutoMap } from '@automapper/classes';
import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class BaseEntity {
  @AutoMap()
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @AutoMap()
  @CreateDateColumn({
    name: 'created_at',
    nullable: true,
    type: 'timestamp with time zone',
    default: () => "(CURRENT_TIMESTAMP AT TIME ZONE 'UTC')",
  })
  createdAt: Date;

  @AutoMap()
  @UpdateDateColumn({
    name: 'updated_at',
    nullable: true,
    type: 'timestamp with time zone',
    default: () => "(CURRENT_TIMESTAMP AT TIME ZONE 'UTC')",
    onUpdate: "CURRENT_TIMESTAMP AT TIME ZONE 'UTC'",
  })
  updatedAt: Date;

  @AutoMap()
  @DeleteDateColumn({
    name: 'deleted_at',
    nullable: true,
    type: 'timestamp with time zone',
    default: null,
  })
  deletedAt: Date;
}
