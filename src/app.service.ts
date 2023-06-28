import { Injectable } from '@nestjs/common';
import { PROJECT_NAME } from './common/constants';

@Injectable()
export class AppService {
  checkServer(): string {
    return `The ${PROJECT_NAME} Up and Running.`;
}
}
