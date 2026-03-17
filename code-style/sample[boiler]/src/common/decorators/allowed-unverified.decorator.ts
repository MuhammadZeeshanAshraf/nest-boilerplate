import { SetMetadata } from '@nestjs/common';

export const AllowedUnverified = () => SetMetadata('allowedUnverified', true);
