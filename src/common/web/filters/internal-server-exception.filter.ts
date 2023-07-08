import {
    ArgumentsHost,
    BadRequestException,
    Catch,
    ExceptionFilter,
    InternalServerErrorException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { RESPONSE_MESSAGE } from 'src/common/constants';
import {
    InternalServerErrorModel,
    ValidationFailedErrorModel,
} from 'src/common/types/error';
import { ResponseFactory } from '../ResponseFactory';

@Catch()
export class InternalServerExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const res: Response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let errorMessage = RESPONSE_MESSAGE.INTERNAL_SERVER_ERROR;
        let response = ResponseFactory.createResponse(
            new InternalServerErrorModel(errorMessage)
        );

        console.log(request.url);
        console.log(exception.constructor);
        console.log(exception);

        switch (exception.constructor) {
            case BadRequestException:
                errorMessage =
                    exception.response.message.length === 1
                        ? exception.response.message[0]
                        : exception.response.message
                              .join(', ')
                              .toLowerCase()
                              .split(' ')
                              .map(function (word) {
                                  return (
                                      word.charAt(0).toUpperCase() +
                                      word.slice(1)
                                  );
                              })
                              .join(' ');
                response = ResponseFactory.createResponse(
                    new ValidationFailedErrorModel(errorMessage)
                );
                break;
            case InternalServerErrorException:
            default:
                errorMessage = RESPONSE_MESSAGE.INTERNAL_SERVER_ERROR;
                response = ResponseFactory.createResponse(
                    new InternalServerErrorModel(errorMessage)
                );
        }

        return res.status(response.code).send(response);
    }
}
