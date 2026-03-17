// clear-redis.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Partner } from '../../modules/partner/entities/partner.entity';
import { RedisService } from '../../modules/redis/redis.service';
import dataSource from '../database/dbConfig';
import {
  CLEAR_REDIS_METADATA,
  ClearRedisOptions,
} from '../decorators/redis-keys.decorator';

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
    if (opts.patterns?.length || opts.prefixes?.length) {
      const partners = await dataSource.getRepository(Partner).find({
        where: [
          {
            firstPartnerId: userId,
          },
          {
            secondPartnerId: userId,
          },
        ],
      });
      const partnerIds = partners.map((p) =>
        p.firstPartnerId === userId ? p.secondPartnerId : p.firstPartnerId,
      );
      patterns.push(
        ...opts.patterns.map((p) =>
          p.replace(':userId', String(userId ?? '*')),
        ),
      );
      if (partnerIds.length) {
        for (const partnerId of partnerIds) {
          patterns.push(
            ...opts.patterns.map((p) =>
              p.replace(':userId', String(partnerId ?? '*')),
            ),
          );
        }
      }
      if (opts.prefixes?.length) {
        for (const p of opts.prefixes) patterns.push(`${p}:${userId ?? '*'}*`);
        if (partnerIds.length) {
          for (const partnerId of partnerIds) {
            for (const p of opts.prefixes)
              patterns.push(`${p}:${partnerId ?? '*'}*`);
          }
        }
      }
    }
    console.log('patterns', patterns);
    return next.handle().pipe(
      tap(async () => {
        await this.redis.delByPattern(patterns);
      }),
    );
  }
}
