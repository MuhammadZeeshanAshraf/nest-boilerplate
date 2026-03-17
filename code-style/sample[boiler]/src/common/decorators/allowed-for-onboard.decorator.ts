import { SetMetadata } from '@nestjs/common';

export const AllowedForOnboard = () => SetMetadata('allowedForOnboard', true);
