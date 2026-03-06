import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsInt, IsNotEmpty } from 'class-validator';

export class SeedToggle {
  @ApiProperty({
    isArray: true,
  })
  @IsArray()
  @IsInt({ each: true })
  @IsNotEmpty()
  ids: number[];

  @ApiProperty({
    enum: ['on', 'off'],
  })
  @IsEnum(['on', 'off'])
  @IsNotEmpty()
  toggle: 'on' | 'off';
}
