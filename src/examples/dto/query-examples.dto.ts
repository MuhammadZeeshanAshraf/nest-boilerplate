import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';

export class QueryExamplesDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Case-insensitive substring match on `name`',
    example: 'sample',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}
