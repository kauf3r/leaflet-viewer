export const appConfig = () => ({
  app: {
    name: 'GeoTIFF Processing API',
    version: '1.0.2',
    port: parseInt(process.env.PORT || '3001', 10),
    environment: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
    s3Bucket: process.env.AWS_S3_BUCKET || 'geotiff-processing-bucket',
  },
  processing: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '53687091200', 10), // 50GB
    supportedFormats: ['.tif', '.tiff', '.gtiff'],
    tileSize: parseInt(process.env.TILE_SIZE || '256', 10),
    maxZoomLevel: parseInt(process.env.MAX_ZOOM_LEVEL || '18', 10),
    tempDirectory: process.env.TEMP_DIRECTORY || '/tmp/geotiff-processing',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
});