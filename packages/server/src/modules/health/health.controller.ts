import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  HealthCheckService,
  HealthCheck,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get system health status' })
  @ApiResponse({ status: 200, description: 'System is healthy' })
  @ApiResponse({ status: 503, description: 'System is unhealthy' })
  @HealthCheck()
  check() {
    return this.health.check([
      // Database health
      () => this.db.pingCheck('database'),
      
      // Memory health (heap should not use more than 500MB)
      () => this.memory.checkHeap('memory_heap', 500 * 1024 * 1024),
      
      // Storage health (disk should not be more than 80% full)
      () => this.disk.checkStorage('storage', {
        threshold: 0.8,
        path: '/',
      }),
    ]);
  }

  @Get('simple')
  @ApiOperation({ summary: 'Simple health check' })
  @ApiResponse({ status: 200, description: 'Service is running' })
  simple() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'GeoTIFF Processing API',
      version: '1.0.2',
      uptime: process.uptime(),
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe for Kubernetes' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  ready() {
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe for Kubernetes' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  live() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }
}