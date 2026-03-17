import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../entities/base.entity';

@Entity('seeds', { schema: 'public' })
export class Seed extends BaseEntity {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Column('character varying', { nullable: false })
  name: string;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  @Column('bool', { nullable: false, default: false })
  seed: boolean;
}
