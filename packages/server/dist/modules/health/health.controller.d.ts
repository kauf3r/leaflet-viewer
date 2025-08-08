import { HealthCheckService, TypeOrmHealthIndicator, MemoryHealthIndicator, DiskHealthIndicator } from '@nestjs/terminus';
export declare class HealthController {
    private health;
    private db;
    private memory;
    private disk;
    constructor(health: HealthCheckService, db: TypeOrmHealthIndicator, memory: MemoryHealthIndicator, disk: DiskHealthIndicator);
    check(): Promise<import("@nestjs/terminus").HealthCheckResult>;
    simple(): {
        status: string;
        timestamp: string;
        service: string;
        version: string;
        uptime: number;
    };
    ready(): {
        status: string;
        timestamp: string;
    };
    live(): {
        status: string;
        timestamp: string;
    };
}
