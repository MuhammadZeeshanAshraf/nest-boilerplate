import { ApiProperty } from '@nestjs/swagger';

export class SucessResponseModel {
    @ApiProperty({
        description: 'Status of API Response True or False',
        example: true,
    })
    status: boolean;
    @ApiProperty({
        description: 'Message from the API',
        example: 'Create Sucessfully',
    })
    message: string;
    @ApiProperty({
        description: 'Http Code of API',
        example: 200,
    })
    code: number;
    @ApiProperty({
        description: 'Data return from the API and Null incase of error',
        example: {}
    })
    data: any;
    @ApiProperty({
        description: 'Error return from the API and Null incase of Sucess',
        example: {
            name: 'Bad Gateway Exception',
        },
    })
    error: any;
}

class InternalErrorModel {
    @ApiProperty()
    name: string;
    @ApiProperty()
    message: string;
    @ApiProperty()
    code: number;
    @ApiProperty()
    stack?: any;
}

export class ErrorResponseModel {
    @ApiProperty({
        description: 'Status of API Response True or False',
        example: true,
    })
    status: boolean;
    @ApiProperty({
        description: 'Message from the API',
        example: 'Create Sucessfully',
    })
    message: string;
    @ApiProperty({
        description: 'Http Code of API',
        example: 200,
    })
    code: number;
    @ApiProperty({
        description: 'Error return from the API and Null incase of Sucess',
        example: {
            name: 'Bad Gateway Exception',
        },
        type: InternalErrorModel,
    })
    error: InternalErrorModel;
}

