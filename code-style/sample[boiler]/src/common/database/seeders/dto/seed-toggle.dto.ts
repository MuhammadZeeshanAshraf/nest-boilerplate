import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import { TOGGLE_ON_OFF } from '../../../constants/enums';

export class SeedToggle {
  @ApiProperty({
    isArray: true,
  })
  @IsArray()
  @IsInt({ each: true })
  @IsNotEmpty()
  ids: number[];

  @ApiProperty({
    enum: TOGGLE_ON_OFF,
  })
  @IsEnum(TOGGLE_ON_OFF)
  @IsNotEmpty()
  toggle: TOGGLE_ON_OFF;
}
