import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class UuidDto {
  @ApiProperty({
    description: "It must be the ID of the entity",
    type: "string",
  })
  @IsUUID("4")
  @IsString()
  @IsNotEmpty()
  uuid: string;
}
