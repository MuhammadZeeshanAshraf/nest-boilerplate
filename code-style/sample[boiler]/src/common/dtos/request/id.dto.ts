import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class BudgetIdDto {
  @ApiProperty({
    description: 'It must be the ID of the entity',
  })
  @Transform(({ value }) => Number(value))
  @IsNumber({ maxDecimalPlaces: 0 })
  @IsInt()
  @IsPositive()
  @Min(1)
  budgetId: number;
}
export class IdDto {
  @ApiProperty({
    description: 'It must be the ID of the entity',
  })
  @Transform(({ value }) => Number(value))
  @IsNumber({ maxDecimalPlaces: 0 })
  @IsInt()
  @IsPositive()
  @Min(1)
  id: number;
}
export class UuidDto {
  @ApiProperty({
    description: 'It must be the ID of the entity',
    type: 'string',
  })
  @IsUUID('4')
  @IsString()
  @IsNotEmpty()
  uuid: string;
}
export function DynamicIdDto(key: string) {
  class DynamicDto {
    @ApiProperty({ description: `It must be the ID of the ${key}` })
    @Transform(({ value }) => Number(value))
    @IsNumber({ maxDecimalPlaces: 0 })
    @IsInt()
    @IsPositive()
    @Min(1)
    id: number;
  }
  Object.defineProperty(
    DynamicDto.prototype,
    key,
    Object.getOwnPropertyDescriptor(DynamicDto.prototype, 'id'),
  );
  delete DynamicDto.prototype.id;

  return DynamicDto;
}
