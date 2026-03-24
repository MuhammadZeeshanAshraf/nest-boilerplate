import { AutoMap } from '@automapper/classes';
export class CreateDummyDto{
    @AutoMap()
    @ApiProperty({ example: 'John Doe' })
    @IsNotEmpty()
    @IsString()
    dummy: string;
}