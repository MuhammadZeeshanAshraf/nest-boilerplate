import { HttpStatus } from '@nestjs/common';
import { NODE_ENV } from '../constants';
import { ErrorResponseModel, SuccessResponseModel } from '../dtos/response';
import {
  ErrorModel,
  ForbiddenErrorModel,
  HandledErrorModel,
  ResourceAlreadyExistsErrorModel,
  ResourceNotFoundErrorModel,
  UnAuthorizedErrorModel,
  ValidationFailedErrorModel,
} from '../types/error';

export class ResponseFactory {
  public static createResponse(
    result: unknown,
    successMessage?: string,
    environment?: string,
  ) {
    if (result instanceof ErrorModel) {
      const stack = result.error?.stack;
      const errorCode = this.getErrorHttpStatusCode(result);

      return this.getErrorResponse(
        result.name,
        result.message,
        errorCode,
        stack,
        environment,
      );
    }

    return this.getSuccessResponse(successMessage, HttpStatus.OK, result);
  }

  private static getErrorHttpStatusCode(error: ErrorModel): number {
    if (error instanceof HandledErrorModel) return HttpStatus.OK;
    if (error instanceof ValidationFailedErrorModel)
      return HttpStatus.BAD_REQUEST;
    if (error instanceof ResourceNotFoundErrorModel)
      return HttpStatus.NOT_FOUND;
    if (error instanceof UnAuthorizedErrorModel) return HttpStatus.UNAUTHORIZED;
    if (error instanceof ForbiddenErrorModel) return HttpStatus.FORBIDDEN;
    if (error instanceof ResourceAlreadyExistsErrorModel)
      return HttpStatus.CONFLICT;
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private static getErrorResponse(
    errorName: string,
    errorMessage: string,
    errorCode: number,
    stack: string | undefined,
    environment: string | undefined,
  ): ErrorResponseModel {
    const errorResponse: ErrorResponseModel = {
      status: false,
      message: errorMessage,
      code: errorCode,
      error: {
        name: errorName,
        message: errorMessage,
        code: errorCode,
        stack,
      },
    };

    if (environment !== NODE_ENV.DEVELOPMENT) {
      delete errorResponse.error.stack;
    }

    return errorResponse;
  }

  private static getSuccessResponse(
    successMessage: string | undefined,
    code: number,
    result: unknown,
  ): SuccessResponseModel {
    return {
      status: true,
      message: successMessage ?? 'Success',
      code,
      data: result,
      error: null,
    };
  }
}
