import { SetMetadata } from '@nestjs/common';

export const DISABLE_AUTH_GUARD_KEY = 'disableAuthGuard';
export const DisableAuthGuard = () => SetMetadata(DISABLE_AUTH_GUARD_KEY, true);
