import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    if (!exception) return;
    if (exception && exception['handled']) return;
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    Sentry.captureException(exception, {
      extra: {
        user: request?.user,
        url: request?.url,
        body: request?.body,
        params: request?.params,
        query: request?.query,
      },
    });
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorResponse = {};

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = exceptionResponse['message'] || message;
        errorResponse = exceptionResponse;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      errorResponse = { name: exception.name, stack: exception.stack };
    } else {
      message = 'Unexpected error occurred';
      errorResponse = { exception };
    }

    // this.logger.error(
    //   `Error occurred: ${message}`,
    //   JSON.stringify({
    //     path: request.url,
    //     method: request.method,
    //     body: request.body,
    //     query: request.query,
    //     params: request.params,
    //     error: errorResponse,
    //   }),
    // );

    if (response.headersSent) {
      // this.logger.warn(
      //   'Headers already sent, cannot send error response again.',
      // );
      return;
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
