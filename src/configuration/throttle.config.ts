import { registerAs } from '@nestjs/config';

export const THROTTLE_CONFIG_NAMESPACE = 'throttle';

export const throttleConfig = registerAs(THROTTLE_CONFIG_NAMESPACE, () => ({
  ttl: parseInt(process.env.THROTTLE_TTL ?? '60', 10),
  limit: parseInt(process.env.THROTTLE_LIMIT ?? '10', 10),
}));

export type ThrottleConfig = ReturnType<typeof throttleConfig>;
