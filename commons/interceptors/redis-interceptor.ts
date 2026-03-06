// clear-redis.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { RedisService } from "../../modules/redis/redis.service";
import {
  CLEAR_REDIS_METADATA,
  ClearRedisOptions,
} from "../decorators/redis-keys.decorator";

@Injectable()
export class ClearRedisInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private redis: RedisService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const opts = this.reflector.get<ClearRedisOptions>(
      CLEAR_REDIS_METADATA,
      context.getHandler(),
    );
    if (!opts) return next.handle();
    const req = context.switchToHttp().getRequest();
    const userId = req.user?.id;
    if (!userId) {
      return next.handle();
    }
    const patterns: string[] = [];
    return next.handle().pipe(
      tap(async () => {
        await this.redis.delByPattern(patterns);
      }),
    );
  }
}
