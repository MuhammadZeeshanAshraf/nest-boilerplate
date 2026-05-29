import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { SKIP_RESPONSE_WRAP } from '../decorators/skip-response-wrap.decorator';
import { SuccessResponseModel } from '../dtos/response';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, SuccessResponseModel | T>
{
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<SuccessResponseModel | T> {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_RESPONSE_WRAP, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skip) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => ({
        status: true,
        message: 'Success',
        code: HttpStatus.OK,
        data,
        error: null,
      })),
    );
  }
}
