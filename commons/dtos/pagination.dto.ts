import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsInt, IsNumber, IsOptional, Min } from "class-validator";

export class PaginationDto {
  @ApiPropertyOptional({
    type: "number",
    description: "Page of fetch records",
    example: "1",
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber({ maxDecimalPlaces: 0 })
  @IsInt()
  @Min(1)
  // Todo adjust to your defaults
  page: number = 1;

  @ApiPropertyOptional({
    type: "number",
    description: "Limit of the fetch records",
    example: "10",
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber({ maxDecimalPlaces: 0 })
  @IsInt()
  @Min(1)
  // Todo adjust to your defaults
  take: number = 10;
}
