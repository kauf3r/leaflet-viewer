"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const health_module_1 = require("./modules/health/health.module");
const files_module_1 = require("./modules/files/files.module");
const processing_module_1 = require("./modules/processing/processing.module");
const tiles_module_1 = require("./modules/tiles/tiles.module");
const database_config_1 = require("./config/database.config");
const app_config_1 = require("./config/app.config");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [app_config_1.appConfig, database_config_1.databaseConfig],
                envFilePath: [
                    '.env.local',
                    '.env.development',
                    '.env',
                ],
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
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
            health_module_1.HealthModule,
            files_module_1.FilesModule,
            processing_module_1.ProcessingModule,
            tiles_module_1.TilesModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map