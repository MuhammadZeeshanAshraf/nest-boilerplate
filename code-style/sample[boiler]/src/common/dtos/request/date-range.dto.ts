import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional } from 'class-validator';

export class DateRangeDto {
  @ApiPropertyOptional({
    example: '2021-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsNotEmpty()
  fromDate?: Date;

  @ApiPropertyOptional({
    example: '2021-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsNotEmpty()
  toDate?: Date;
}
