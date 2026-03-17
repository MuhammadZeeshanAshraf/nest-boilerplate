import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import tracer from 'dd-trace';
import { Observable, tap } from 'rxjs';

@Injectable()
export class UserTrackingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { user } = request;
    const span = tracer.scope().active();
    if (span) {
      span.addTags({
        'user.id': user?.id,
        'user.name': user?.name,
        'user.email': user?.email,
      });
    }

    return next.handle().pipe(tap(() => span.finish()));
  }
}
