import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter
} from '@nestjs/common';
import { Response } from 'express';
import { ValidationFailedErrorModel } from '../../types/error';
import { ResponseFactory } from '../ResponseFactory';

@Catch(BadRequestException)
export class DtoValidationExceptionHandler
  implements ExceptionFilter<BadRequestException>
{
  public catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res: Response = ctx.getResponse();
    let errorMessage =
      exception.response.message.length === 1
        ? exception.response.message[0]
        : exception.response.message.join(', ').toLowerCase().split(' ').map(function (word) {
          return (word.charAt(0).toUpperCase() + word.slice(1));
        }).join(' ');
    const response = ResponseFactory.createResponse(
      new ValidationFailedErrorModel(errorMessage)
    );
    return res.status(response.code).send(response);
  }
}
