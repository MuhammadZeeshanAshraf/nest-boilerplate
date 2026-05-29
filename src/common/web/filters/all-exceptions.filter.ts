import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { RESPONSE_MESSAGE } from '../../constants';
import {
  ErrorModel,
  ForbiddenErrorModel,
  InternalServerErrorModel,
  ResourceAlreadyExistsErrorModel,
  ResourceNotFoundErrorModel,
  UnAuthorizedErrorModel,
  ValidationFailedErrorModel,
} from '../../types/error';
import { ResponseFactory } from '../ResponseFactory';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const errorModel = this.toErrorModel(exception);
    const response = ResponseFactory.createResponse(
      errorModel,
      undefined,
      process.env.NODE_ENV,
    );

    if (response.code >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${req.method} ${req.url} -> ${response.code}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(
        `${req.method} ${req.url} -> ${response.code}: ${response.message}`,
      );
    }

    return res.status(response.code).send(response);
  }

  private toErrorModel(exception: unknown): ErrorModel {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const message = this.extractMessage(exception);

      switch (status) {
        case HttpStatus.BAD_REQUEST:
          return new ValidationFailedErrorModel(message);
        case HttpStatus.UNAUTHORIZED:
          return new UnAuthorizedErrorModel(message);
        case HttpStatus.FORBIDDEN:
          return new ForbiddenErrorModel(message);
        case HttpStatus.NOT_FOUND:
          return new ResourceNotFoundErrorModel(message);
        case HttpStatus.CONFLICT:
          return new ResourceAlreadyExistsErrorModel(message);
        default:
          return new InternalServerErrorModel(message);
      }
    }

    return new InternalServerErrorModel(RESPONSE_MESSAGE.INTERNAL_SERVER_ERROR);
  }

  private extractMessage(exception: HttpException): string {
    const errorResponse = exception.getResponse();

    if (typeof errorResponse === 'string') {
      return errorResponse;
    }

    const message = (errorResponse as Record<string, unknown>)?.message;

    if (Array.isArray(message)) {
      const joined = message.join(', ');
      return message.length === 1 ? message[0] : this.titleCase(joined);
    }

    if (typeof message === 'string') {
      return message;
    }

    return exception.message || RESPONSE_MESSAGE.INTERNAL_SERVER_ERROR;
  }

  private titleCase(value: string): string {
    return value
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
