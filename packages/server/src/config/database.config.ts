export const databaseConfig = () => ({
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'user',
    password: process.env.DB_PASSWORD || 'pass',
    database: process.env.DB_DATABASE || 'geotiff_db',
    synchronize: process.env.DB_SYNCHRONIZE === 'true' || process.env.NODE_ENV !== 'production',
    logging: process.env.DB_LOGGING === 'true' || process.env.NODE_ENV === 'development',
    ssl: process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production',
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '100', 10),
    acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT || '60000', 10),
    timeout: parseInt(process.env.DB_TIMEOUT || '60000', 10),
  },
});