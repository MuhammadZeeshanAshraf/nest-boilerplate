import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';
import { DEFLAUT_PAGE, PAGE_SIZE } from 'src/common/constants';

export class PaginationDto {
    @ApiPropertyOptional({
        type: 'number',
        description: 'Page of fetch records',
        example: '1',
    })
    @IsOptional()
    @Transform(({ value }) => Number(value))
    @IsNumber({ maxDecimalPlaces: 0 })
    @IsInt()
    @Min(1)
    page: number = DEFLAUT_PAGE;

    @ApiPropertyOptional({
        type: 'number',
        description: 'Limit of the fetch records',
        example: '10',
    })
    @IsOptional()
    @Transform(({ value }) => Number(value))
    @IsNumber({ maxDecimalPlaces: 0 })
    @IsInt()
    @Min(1)
    take: number = PAGE_SIZE;
}
