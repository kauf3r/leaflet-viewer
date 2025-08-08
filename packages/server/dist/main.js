"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-eval'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "blob:", "https:"],
                fontSrc: ["'self'", "data:"],
                connectSrc: ["'self'", "https:"],
                mediaSrc: ["'self'", "blob:"],
                objectSrc: ["'none'"],
                baseUri: ["'self'"],
                formAction: ["'self'"],
                frameAncestors: ["'none'"],
                upgradeInsecureRequests: [],
            },
        },
        crossOriginEmbedderPolicy: false,
    }));
    app.use((0, compression_1.default)());
    app.enableCors({
        origin: [
            'http://localhost:3000',
            'http://localhost:5173',
            process.env.FRONTEND_URL,
        ].filter((url) => Boolean(url)),
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.setGlobalPrefix('api/v1');
    if (process.env.NODE_ENV !== 'production') {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('GeoTIFF Processing API')
            .setDescription('Enterprise GeoTIFF Processing and Visualization API')
            .setVersion('1.0.2')
            .addBearerAuth()
            .addTag('files', 'GeoTIFF file management')
            .addTag('processing', 'GeoTIFF processing operations')
            .addTag('tiles', 'Map tile serving')
            .addTag('health', 'System health checks')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/docs', app, document, {
            swaggerOptions: {
                persistAuthorization: true,
            },
        });
    }
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 GeoTIFF Processing API running on: http://localhost:${port}`);
    console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}
bootstrap().catch((error) => {
    console.error('💥 Application failed to start:', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map