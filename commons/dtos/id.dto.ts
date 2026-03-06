import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsInt, IsNumber, IsPositive, Min } from "class-validator";

export class IdDto {
  @ApiProperty({
    description: "It must be the ID of the entity",
  })
  @Transform(({ value }) => Number(value))
  @IsNumber({ maxDecimalPlaces: 0 })
  @IsInt()
  @IsPositive()
  @Min(1)
  id: number;
}
