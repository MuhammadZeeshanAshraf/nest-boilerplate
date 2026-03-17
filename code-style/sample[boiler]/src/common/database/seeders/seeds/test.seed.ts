import { Injectable } from '@nestjs/common';
import { ColoredLogger } from 'src/common/logger/logger.service';

@Injectable()
export class DummySeed {
  constructor(private readonly logger: ColoredLogger) {}

  async seed() {
    this.logger.log('DummySeed');
  }
}
