import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class RunSeedDto {
  @ApiProperty({
    isArray: true,
    example: ['DummySeed'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  seeds: string[];
}
