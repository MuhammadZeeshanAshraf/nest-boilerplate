import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

class SeedDto {
  @ApiProperty({})
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  @IsNotEmpty()
  seed: boolean = false;
}

export class CreateSeedDto {
  @ApiProperty({
    isArray: true,
    type: SeedDto,
    example: [
      {
        name: 'DummySeed',
        seed: true,
      },
    ],
  })
  @IsArray()
  @IsNotEmpty()
  @Type(() => SeedDto)
  @ValidateNested({ each: true })
  seeds: SeedDto[];
}
