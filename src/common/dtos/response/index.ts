import { ApiProperty } from '@nestjs/swagger';

export class SuccessResponseModel {
  @ApiProperty({
    description: 'Status of API Response (true on success, false on error)',
    example: true,
  })
  status: boolean;

  @ApiProperty({
    description: 'Message from the API',
    example: 'Created successfully',
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 200,
  })
  code: number;

  @ApiProperty({
    description: 'Data returned from the API (null on error)',
    example: {},
  })
  data: any;

  @ApiProperty({
    description: 'Error returned from the API (null on success)',
    example: null,
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
    description: 'Status of API Response (false on error)',
    example: false,
  })
  status: boolean;

  @ApiProperty({
    description: 'Message from the API',
    example: 'Validation failed',
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  code: number;

  @ApiProperty({
    description: 'Error details',
    type: InternalErrorModel,
  })
  error: InternalErrorModel;
}
