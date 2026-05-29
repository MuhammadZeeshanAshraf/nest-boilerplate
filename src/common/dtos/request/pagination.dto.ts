import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';
import { DEFAULT_PAGE, PAGE_SIZE } from '../../constants';

export class PaginationDto {
  @ApiPropertyOptional({
    type: 'number',
    description: 'Page number for fetching records',
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber({ maxDecimalPlaces: 0 })
  @IsInt()
  @Min(1)
  page: number = DEFAULT_PAGE;

  @ApiPropertyOptional({
    type: 'number',
    description: 'Maximum number of records to fetch',
    example: 10,
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber({ maxDecimalPlaces: 0 })
  @IsInt()
  @Min(1)
  take: number = PAGE_SIZE;
}
