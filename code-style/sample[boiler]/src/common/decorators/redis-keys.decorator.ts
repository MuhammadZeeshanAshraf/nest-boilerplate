import { SetMetadata } from '@nestjs/common';

export const CLEAR_REDIS_METADATA = 'clear_redis_metadata';
export type ClearRedisOptions = { prefixes?: string[]; patterns?: string[] };
export const ClearRedis = (opts: ClearRedisOptions) =>
  SetMetadata(CLEAR_REDIS_METADATA, opts);
