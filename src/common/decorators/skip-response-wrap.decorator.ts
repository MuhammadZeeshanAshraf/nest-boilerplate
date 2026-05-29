import { SetMetadata } from '@nestjs/common';

export const SKIP_RESPONSE_WRAP = 'skipResponseWrap';

/**
 * Mark a handler/controller so the global ResponseInterceptor leaves
 * its return value untouched. Use this for endpoints whose output has
 * its own well-defined shape (e.g. health checks, file downloads).
 */
export const SkipResponseWrap = () => SetMetadata(SKIP_RESPONSE_WRAP, true);
