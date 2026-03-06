import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface SuccessResponse {
  status: true;
  statusCode: number;
  path: string;
  message: string | null;
  data: any;
  timeTaken: string;
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startTime = Date.now();
    return next
      .handle()
      .pipe(
        map((res: unknown) => this.responseHandler(res, context, startTime)),
      );
  }

  private responseHandler(
    res: unknown,
    context: ExecutionContext,
    startTime: number,
  ): SuccessResponse | null {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    if (response.headersSent) {
      return null;
    }

    let result = res as any;

    if (
      (result == null || typeof result !== 'object') &&
      typeof result !== 'string'
    ) {
      result = {};
    }

    const message =
      result?.message || (typeof result === 'string' ? result : 'Success');

    let serializedResult: any;
    try {
      serializedResult = JSON.parse(
        JSON.stringify(result, (key, value) => {
          if (typeof value === 'bigint') {
            return value.toString();
          }
          if (value && typeof value === 'object') {
            if (value.constructor?.name === 'Socket') {
              return '[Socket]';
            }
            if (value.constructor?.name === 'HTTPParser') {
              return '[HTTPParser]';
            }
          }
          return value;
        }),
      );
    } catch {
      serializedResult = result;
    }

    const timeTaken = (Date.now() - startTime) / 100;
    return {
      status: true,
      path: request.url,
      statusCode: response.statusCode,
      data:
        Array.isArray(serializedResult) ||
        Object.keys(serializedResult || {}).length > 0
          ? serializedResult
          : null,
      message,
      timeTaken: `${timeTaken} ms`,
    };
  }
}
