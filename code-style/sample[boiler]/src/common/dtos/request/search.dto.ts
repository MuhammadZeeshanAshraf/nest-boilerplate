import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto, PaginationDtoDefault10 } from './pagination.dto';

export class SearchDto extends PaginationDto {
  @ApiPropertyOptional({
    type: 'string',
    description: 'Search keyword for filtering records',
    example: 'United Kingdom',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
export class SearchDtoWithPagination10 extends PaginationDtoDefault10 {
  @ApiPropertyOptional({
    type: 'string',
    description: 'Search keyword for filtering records',
    example: 'United Kingdom',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
