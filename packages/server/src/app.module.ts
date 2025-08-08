import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './modules/health/health.module';
import { FilesModule } from './modules/files/files.module';
import { ProcessingModule } from './modules/processing/processing.module';
import { TilesModule } from './modules/tiles/tiles.module';
import { databaseConfig } from './config/database.config';
import { appConfig } from './config/app.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      envFilePath: [
        '.env.local',
        '.env.development',
        '.env',
      ],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME || 'user',
        password: process.env.DB_PASSWORD || 'pass',
        database: process.env.DB_DATABASE || 'geotiff_db',
        autoLoadEntities: true,
        synchronize: process.env.NODE_ENV !== 'production',
        logging: process.env.NODE_ENV === 'development',
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      }),
    }),

    // Feature modules
    HealthModule,
    FilesModule,
    ProcessingModule,
    TilesModule,
  ],
})
export class AppModule {}