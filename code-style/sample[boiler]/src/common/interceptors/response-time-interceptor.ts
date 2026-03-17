import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  constructor() {}

  intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    // console.info(`Started timer at : ${now}ms`);
    return next.handle().pipe(
      tap((responseData) => {
        responseData['timeTaken'] = (Date.now() - now) / 100;
      }),
    );
  }
}
