import { Global, Module } from '@nestjs/common';
import { ColoredLogger } from './logger.service';

@Global()
@Module({
  exports: [ColoredLogger],
  providers: [ColoredLogger],
})
export class LoggerModule {}
