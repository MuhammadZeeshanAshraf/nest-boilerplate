import { Global, Module } from '@nestjs/common';
import { UtilsService } from './UtilsService';

@Global()
@Module({
  providers: [UtilsService],
  exports: [UtilsService],
})
export class UtilsModule {}
