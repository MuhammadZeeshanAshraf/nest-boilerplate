import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { monitorEventLoopDelay } from 'node:perf_hooks';
import { CRON_JOB_NAME } from '../../common/constants';

type EventLoopDelayMonitor = ReturnType<typeof monitorEventLoopDelay>;

const BYTES_PER_MB = 1024 * 1024;
const NANOSECONDS_PER_MS = 1e6;

/**
 * Reports lightweight runtime metrics every minute. Useful as a
 * baseline observability signal in dev and as a reference for how to
 * write a real scheduled job using `@nestjs/schedule`.
 *
 * Replace or remove this in a real project — most teams will prefer
 * Prometheus, OpenTelemetry, or APM exporters instead of log lines.
 */
@Injectable()
export class ServerMonitorCronService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(ServerMonitorCronService.name);
  private readonly eventLoopMonitor: EventLoopDelayMonitor =
    monitorEventLoopDelay({ resolution: 20 });

  onApplicationBootstrap() {
    this.eventLoopMonitor.enable();
  }

  onApplicationShutdown() {
    this.eventLoopMonitor.disable();
  }

  @Cron(CronExpression.EVERY_MINUTE, {
    name: CRON_JOB_NAME.REPORT_RUNTIME_METRICS,
  })
  reportRuntimeMetrics() {
    const memory = process.memoryUsage();

    this.logger.log({
      msg: 'runtime metrics',
      uptimeSec: Math.round(process.uptime()),
      memory: {
        heapUsedMb: round(memory.heapUsed / BYTES_PER_MB),
        heapTotalMb: round(memory.heapTotal / BYTES_PER_MB),
        rssMb: round(memory.rss / BYTES_PER_MB),
        externalMb: round(memory.external / BYTES_PER_MB),
      },
      eventLoopLagMs: {
        mean: round(this.eventLoopMonitor.mean / NANOSECONDS_PER_MS),
        p99: round(this.eventLoopMonitor.percentile(99) / NANOSECONDS_PER_MS),
        max: round(this.eventLoopMonitor.max / NANOSECONDS_PER_MS),
      },
    });

    this.eventLoopMonitor.reset();
  }
}

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
