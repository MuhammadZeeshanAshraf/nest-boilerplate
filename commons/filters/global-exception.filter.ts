import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponsePayload {
  status: false;
  statusCode: number;
  path: string;
  message: string;
  errorCode?: string;
  data?: any;
  timestamp: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    console.error(exception);

    if (response.headersSent) {
      return;
    }
    this.logger.log(`Exception: ${JSON.stringify(exception)}`);

    const errorInfo = this.extractErrorInfo(exception);

    const { message } = errorInfo;

    const errorResponse: ErrorResponsePayload = {
      status: false,
      statusCode: errorInfo.statusCode,
      path: request.url,
      message,
      timestamp: new Date().toISOString(),
    };

    if (errorInfo.errorCode) {
      errorResponse.errorCode = errorInfo.errorCode;
    }

    if (errorInfo.data !== undefined && errorInfo.data !== null) {
      errorResponse.data = errorInfo.data;
    }

    response.status(errorInfo.statusCode).json(errorResponse);
  }

  private extractErrorInfo(exception: unknown): {
    statusCode: number;
    message: string;
    errorCode?: string;
    data?: any;
    messageKey?: string;
    entity?: string;
  } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        return {
          statusCode: status,
          message: exceptionResponse,
        };
      }

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, any>;

        let { message } = resp;
        if (Array.isArray(message)) {
          message = message.join(', ');
        }
        message = message || exception.message || 'An error occurred';

        return {
          statusCode: status,
          message,
          errorCode: resp.errorCode || resp.error,
          data: resp.data,
          messageKey: resp.messageKey,
          entity: resp.entity,
        };
      }

      return {
        statusCode: status,
        message: exception.message,
      };
    }

    if (exception instanceof Error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: exception.message || 'Internal server error',
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Unexpected error occurred',
    };
  }
}
