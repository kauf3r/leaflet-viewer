// Note: zod import will be handled by package installation
// For now, we'll provide a basic validation system
type ZodSchema<T> = {
  parse: (input: unknown) => T;
};

// Basic validation helper (replace with zod when available)
const createEnvSchema = <T extends Record<string, any>>(defaultValues: T): ZodSchema<T> => ({
  parse: (input: unknown) => ({ ...defaultValues, ...(input as any) } as T),
});

// Define the environment configuration type
export interface Env {
  // Application Environment
  NODE_ENV: 'development' | 'production' | 'test';
  NEXT_PUBLIC_APP_URL: string;
  NEXT_PUBLIC_APP_NAME: string;

  // File Processing Configuration
  NEXT_PUBLIC_MAX_FILE_SIZE_MB: number;
  NEXT_PUBLIC_SUPPORTED_FORMATS: string;
  NEXT_PUBLIC_MAX_CONCURRENT_LAYERS: number;

  // Map Configuration
  NEXT_PUBLIC_DEFAULT_MAP_CENTER_LAT: number;
  NEXT_PUBLIC_DEFAULT_MAP_CENTER_LNG: number;
  NEXT_PUBLIC_DEFAULT_ZOOM_LEVEL: number;
  NEXT_PUBLIC_MAX_ZOOM_LEVEL: number;
  NEXT_PUBLIC_MIN_ZOOM_LEVEL: number;

  // Performance & Monitoring
  NEXT_PUBLIC_ENABLE_ANALYTICS: boolean;
  NEXT_PUBLIC_DEBUG_MODE: boolean;
  NEXT_PUBLIC_ENABLE_DEVTOOLS: boolean;

  // Optional Cloud Storage Configuration
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  AWS_REGION?: string;
  AWS_S3_BUCKET?: string;

  // Optional Google Cloud Storage
  GOOGLE_CLOUD_PROJECT_ID?: string;
  GOOGLE_CLOUD_PRIVATE_KEY?: string;
  GOOGLE_CLOUD_CLIENT_EMAIL?: string;
  GOOGLE_CLOUD_STORAGE_BUCKET?: string;

  // Optional Azure Blob Storage
  AZURE_STORAGE_ACCOUNT_NAME?: string;
  AZURE_STORAGE_ACCOUNT_KEY?: string;
  AZURE_STORAGE_CONTAINER_NAME?: string;

  // Optional Authentication
  NEXTAUTH_SECRET?: string;
  NEXTAUTH_URL?: string;

  // Optional Monitoring
  VERCEL_ANALYTICS_ID?: string;
  SENTRY_DSN?: string;
  SENTRY_ORG?: string;
  SENTRY_PROJECT?: string;

  // Optional Rate Limiting
  RATE_LIMIT_MAX_REQUESTS?: number;
  RATE_LIMIT_WINDOW_MS?: number;

  // Optional CORS Configuration
  ALLOWED_ORIGINS?: string;

  // Optional Webhook Configuration
  WEBHOOK_SECRET?: string;
  PROCESSING_WEBHOOK_URL?: string;

  // Optional Tile Server Configuration
  NEXT_PUBLIC_TILE_SERVER_URL?: string;
  NEXT_PUBLIC_SATELLITE_TILE_URL?: string;
}

// Default values for environment variables
const defaultEnv: Env = {
  NODE_ENV: 'development',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  NEXT_PUBLIC_APP_NAME: 'GeoTIFF Showcase Tool',
  NEXT_PUBLIC_MAX_FILE_SIZE_MB: 1024,
  NEXT_PUBLIC_SUPPORTED_FORMATS: 'tif,tiff,gtiff',
  NEXT_PUBLIC_MAX_CONCURRENT_LAYERS: 4,
  NEXT_PUBLIC_DEFAULT_MAP_CENTER_LAT: 0,
  NEXT_PUBLIC_DEFAULT_MAP_CENTER_LNG: 0,
  NEXT_PUBLIC_DEFAULT_ZOOM_LEVEL: 2,
  NEXT_PUBLIC_MAX_ZOOM_LEVEL: 18,
  NEXT_PUBLIC_MIN_ZOOM_LEVEL: 1,
  NEXT_PUBLIC_ENABLE_ANALYTICS: false,
  NEXT_PUBLIC_DEBUG_MODE: false,
  NEXT_PUBLIC_ENABLE_DEVTOOLS: true,
};

const envSchema = createEnvSchema(defaultEnv);

// Validate and parse environment variables
function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Invalid environment variables:', error);
    throw new Error('Invalid environment configuration');
  }
}

// Export validated environment variables
export const env = validateEnv();

// Helper functions for common environment checks
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

// File processing helpers
export const getMaxFileSize = (): number => env.NEXT_PUBLIC_MAX_FILE_SIZE_MB * 1024 * 1024; // Convert to bytes
export const getSupportedFormats = (): string[] => env.NEXT_PUBLIC_SUPPORTED_FORMATS.split(',').map((f: string) => f.trim());
export const getMaxConcurrentLayers = (): number => env.NEXT_PUBLIC_MAX_CONCURRENT_LAYERS;

// Map configuration helpers
export const getDefaultMapCenter = (): [number, number] => [
  env.NEXT_PUBLIC_DEFAULT_MAP_CENTER_LAT,
  env.NEXT_PUBLIC_DEFAULT_MAP_CENTER_LNG,
];
export const getDefaultZoomLevel = (): number => env.NEXT_PUBLIC_DEFAULT_ZOOM_LEVEL;
export const getMaxZoomLevel = (): number => env.NEXT_PUBLIC_MAX_ZOOM_LEVEL;
export const getMinZoomLevel = (): number => env.NEXT_PUBLIC_MIN_ZOOM_LEVEL;

// Cloud storage configuration helpers
export const hasAWSConfig = (): boolean => 
  !!(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY && env.AWS_REGION && env.AWS_S3_BUCKET);

export const hasGoogleCloudConfig = (): boolean => 
  !!(env.GOOGLE_CLOUD_PROJECT_ID && env.GOOGLE_CLOUD_PRIVATE_KEY && 
     env.GOOGLE_CLOUD_CLIENT_EMAIL && env.GOOGLE_CLOUD_STORAGE_BUCKET);

export const hasAzureConfig = (): boolean => 
  !!(env.AZURE_STORAGE_ACCOUNT_NAME && env.AZURE_STORAGE_ACCOUNT_KEY && 
     env.AZURE_STORAGE_CONTAINER_NAME);

// Feature flags
export const isAnalyticsEnabled = (): boolean => env.NEXT_PUBLIC_ENABLE_ANALYTICS;
export const isDebugMode = (): boolean => env.NEXT_PUBLIC_DEBUG_MODE && isDevelopment;
export const areDevToolsEnabled = (): boolean => env.NEXT_PUBLIC_ENABLE_DEVTOOLS && isDevelopment;

// Security helpers
export const getAllowedOrigins = (): string[] => 
  env.ALLOWED_ORIGINS ? env.ALLOWED_ORIGINS.split(',').map((origin: string) => origin.trim()) : [];

// Rate limiting configuration
export const getRateLimitConfig = (): { maxRequests: number; windowMs: number } | null => {
  if (env.RATE_LIMIT_MAX_REQUESTS && env.RATE_LIMIT_WINDOW_MS) {
    return {
      maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
      windowMs: env.RATE_LIMIT_WINDOW_MS,
    };
  }
  return null;
};

// Monitoring configuration
export const hasMonitoringConfig = (): boolean => 
  !!(env.VERCEL_ANALYTICS_ID || env.SENTRY_DSN);

// Webhook configuration
export const hasWebhookConfig = (): boolean => 
  !!(env.WEBHOOK_SECRET && env.PROCESSING_WEBHOOK_URL);

// Tile server configuration
export const getTileServerUrl = (): string => 
  env.NEXT_PUBLIC_TILE_SERVER_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

export const getSatelliteTileUrl = (): string => 
  env.NEXT_PUBLIC_SATELLITE_TILE_URL || 
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

// Validation helper for runtime environment checks
export function validateRuntimeEnv(): void {
  if (isProduction) {
    // In production, ensure critical security configurations are present
    if (!env.NEXTAUTH_SECRET && !env.WEBHOOK_SECRET) {
      console.warn('⚠️ No security secrets configured for production');
    }
    
    if (env.NEXT_PUBLIC_DEBUG_MODE) {
      console.warn('⚠️ Debug mode is enabled in production');
    }
  }
  
  if (isDevelopment) {
    console.log('🚀 Development environment loaded');
    if (isDebugMode()) {
      console.log('🐛 Debug mode enabled');
    }
  }
}