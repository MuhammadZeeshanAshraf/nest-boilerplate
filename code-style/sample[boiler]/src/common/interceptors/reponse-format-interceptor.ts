import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import * as fs from 'fs';
import path from 'path';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor() {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startTime = Date.now();
    return next.handle().pipe(
      map((res: unknown) => this.responseHandler(res, context, startTime)),
      catchError((err) => {
        const req = context.switchToHttp().getRequest();
        Sentry.captureException(err, {
          extra: {
            user: req?.user,
            url: req?.url,
            body: req?.body,
            params: req?.params,
            query: req?.query,
            response: err?.response,
            stack: err?.stack,
          },
        });
        this.errorHandler(err, context, startTime);
        err['handled'] = true;
        return throwError(() => err);
      }),
    );
  }

  errorHandler(
    exception: HttpException,
    context: ExecutionContext,
    startTime: number,
  ) {
    console.log('exception', exception);
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const timeTaken = (Date.now() - startTime) / 100;
    const lang = request.headers['lang'] || 'en';
    if (lang !== 'en') {
      const translation = this.translateMessage(lang, exception.message);
      exception.message = translation;
      if (exception?.['response']?.message) {
        exception['response'].message = translation;
      }
    }
    response.status(status).json({
      status: false,
      statusCode: status,
      path: request.url,
      message: exception.message,
      errorCode:
        exception instanceof HttpException
          ? // eslint-disable-next-line @typescript-eslint/dot-notation
            exception.getResponse()['errorCode'] || null
          : null,
      data:
        exception instanceof HttpException
          ? // eslint-disable-next-line @typescript-eslint/dot-notation
            exception.getResponse()['data'] || null
          : null,
      result: exception,
      timeTaken: `${timeTaken} ms`,
    });
  }

  responseHandler(res: any, context: ExecutionContext, startTime: number) {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let result = res;

    if (
      (result == null || typeof result !== 'object') &&
      typeof result !== 'string'
    ) {
      result = {};
    }

    if (
      Object.prototype.hasOwnProperty.call(result, 'error') &&
      result.status === false
    ) {
      const lang = request.headers['lang'] || 'en';
      if (lang !== 'en') {
        const translation = this.translateMessage(lang, result.message || '');
        result.message = translation;
      }
      return {
        status: false,
        path: request.url,
        statusCode: result?.code,
        data: result?.data,
        message: result.message,
        error: result,
      };
    }

    let message =
      result?.message || (typeof result === 'string' ? result : null);
    if (result && typeof result === 'object') {
      delete result.message;
    }

    const serializedResult = JSON.parse(
      JSON.stringify(result, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      ),
    );
    const timeTaken = (Date.now() - startTime) / 100;
    if (message) {
      const lang = request.headers['lang'] || 'en';
      if (lang !== 'en') {
        const translation = this.translateMessage(lang, message);
        message = translation;
      }
    }
    return {
      status: true,
      path: request.url,
      statusCode: response.statusCode,
      data:
        Array.isArray(serializedResult) ||
        Object.keys(serializedResult).length > 0
          ? serializedResult
          : null,
      message,
      timeTaken: `${timeTaken} ms`,
    };
  }

  private translateMessage(language: string, message: string) {
    if (!language || !message) return message;
    const translationsJSON = fs.readFileSync(
      path.join(__dirname, '../../modules/translation/json/translation.json'),
      'utf8',
    );
    const translations = JSON.parse(translationsJSON);
    return (
      translations[message.toLowerCase().replaceAll(' ', '_')]?.[0]?.[language]
        ?.name ?? message
    );
  }
}
