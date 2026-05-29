import { Injectable } from '@nestjs/common';
import { PROJECT_NAME } from './common/constants';

@Injectable()
export class AppService {
  checkServer(): string {
    return `${PROJECT_NAME} is up and running.`;
  }
}
