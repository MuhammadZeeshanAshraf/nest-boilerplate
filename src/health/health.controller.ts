import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
} from '@nestjs/terminus';
import { ApiTags } from '@nestjs/swagger';
import { SkipResponseWrap } from '../common/decorators/skip-response-wrap.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthCheckService) {}

  @Get()
  @HealthCheck()
  @SkipResponseWrap()
  check(): Promise<HealthCheckResult> {
    return this.health.check([]);
  }
}
