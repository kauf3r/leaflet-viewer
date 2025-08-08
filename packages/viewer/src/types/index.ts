/**
 * Comprehensive type definitions for the GeoTIFF Leaflet Viewer
 */

// Core GeoTIFF types
export interface GeoTIFFMetadata {
  width: number;
  height: number;
  tileWidth?: number;
  tileHeight?: number;
  samplesPerPixel: number;
  bitsPerSample: number[];
  photometricInterpretation: number;
  compression: number;
  planarConfiguration: number;
  geoKeyDirectory?: Record<string, unknown>;
  origin: [number, number];
  resolution: [number, number];
  projection?: string;
  epsg?: number;
  noDataValue?: number;
  fileSize: number;
  lastModified: Date;
}

export interface GeoTIFFBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface GeoTIFFLayer {
  id: string;
  name: string;
  url: string;
  rawData?: ArrayBuffer; // Store raw file data for direct access
  metadata: GeoTIFFMetadata;
  bounds: GeoTIFFBounds;
  opacity: number;
  visible: boolean;
  loadingState: 'idle' | 'loading' | 'loaded' | 'error';
  error?: string;
  thumbnail?: string;
  colorMap?: ColorMap;
  statistics?: LayerStatistics;
}

export interface ColorMap {
  type: 'rainbow' | 'terrain' | 'viridis' | 'plasma' | 'custom';
  range: [number, number];
  colors?: string[];
  stops?: Array<{ value: number; color: string }>;
}

export interface LayerStatistics {
  min: number;
  max: number;
  mean: number;
  stddev: number;
  histogram: number[];
  uniqueValues?: number[];
  nullCount: number;
}

// Map component types
export interface MapViewport {
  center: [number, number];
  zoom: number;
  bounds?: [[number, number], [number, number]];
}

export interface MapControls {
  zoomControl: boolean;
  scaleControl: boolean;
  attributionControl: boolean;
  fullscreenControl: boolean;
  measureControl: boolean;
  layerControl: boolean;
}

export interface MapConfiguration {
  viewport: MapViewport;
  controls: MapControls;
  baseLayers: BaseLayer[];
  overlayLayers: GeoTIFFLayer[];
  maxZoom: number;
  minZoom: number;
  maxBounds?: [[number, number], [number, number]];
  crs?: string;
}

export interface BaseLayer {
  id: string;
  name: string;
  url: string;
  attribution: string;
  maxZoom: number;
  type: 'tile' | 'wms' | 'wmts';
  active: boolean;
}

// Performance monitoring types
export interface PerformanceMetrics {
  name: string;
  value: number;
  id: string;
  timestamp: number;
  url: string;
  userAgent?: string;
  connection?: {
    effectiveType: string;
    downlink: number;
  };
}

export interface MemoryMetrics {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  timestamp: number;
}

export interface LoadingPerformance {
  componentName: string;
  loadTime: number;
  cacheHit: boolean;
  bundleSize?: number;
  timestamp: number;
}

export interface CacheStatistics {
  size: number; // MB
  entries: number;
  hitRate: number;
  memoryUsage: number; // MB
  indexedDBUsage?: number; // MB
}

// File processing types
export interface FileUpload {
  file: File;
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
  result?: GeoTIFFLayer;
  validationResult?: FileValidation;
}

export interface FileValidation {
  isValid: boolean;
  fileType: string;
  fileSize: number;
  issues: ValidationIssue[];
  warnings: ValidationWarning[];
}

export interface ValidationIssue {
  type: 'error' | 'warning';
  message: string;
  code: string;
  details?: Record<string, unknown>;
}

export interface ValidationWarning {
  message: string;
  code: string;
  severity: 'low' | 'medium' | 'high';
}

// Analysis tools types
export interface AnalysisResult {
  id: string;
  type: AnalysisType;
  layerId: string;
  geometry?: {
    type: string;
    coordinates: number[] | number[][] | number[][][];
  };
  result: Record<string, unknown>;
  timestamp: Date;
}

export type AnalysisType = 
  | 'point-query'
  | 'line-profile'
  | 'area-statistics'
  | 'histogram'
  | 'contours'
  | 'slope'
  | 'aspect'
  | 'hillshade';

export interface PointQueryResult {
  coordinate: [number, number];
  value: number | null;
  interpolatedValue?: number;
  metadata: {
    band: number;
    dataType: string;
    noDataValue?: number;
  };
}

export interface LineProfileResult {
  coordinates: [number, number][];
  values: (number | null)[];
  distance: number;
  elevation?: number[];
}

export interface AreaStatisticsResult {
  area: number; // square meters
  statistics: LayerStatistics;
  pixelCount: number;
  validPixelCount: number;
}

// UI component props types
export interface MapViewerProps {
  initialLayers?: GeoTIFFLayer[];
  configuration?: Partial<MapConfiguration>;
  onLayerAdd?: (layer: GeoTIFFLayer) => void;
  onLayerRemove?: (layerId: string) => void;
  onLayerUpdate?: (layerId: string, updates: Partial<GeoTIFFLayer>) => void;
  onViewportChange?: (viewport: MapViewport) => void;
  className?: string;
  style?: React.CSSProperties;
}

export interface LayerPanelProps {
  layers: GeoTIFFLayer[];
  onLayerToggle: (layerId: string) => void;
  onLayerOpacityChange: (layerId: string, opacity: number) => void;
  onLayerRemove: (layerId: string) => void;
  onLayerReorder: (layerIds: string[]) => void;
  className?: string;
}

export interface GeoTIFFProcessorProps {
  onFileProcessed: (layer: GeoTIFFLayer) => void;
  onProgress: (progress: number) => void;
  onError: (error: string) => void;
  maxFileSize?: number;
  supportedFormats?: string[];
  className?: string;
}

// API response types
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface UploadResponse extends APIResponse<GeoTIFFLayer> {
  processingTime: number;
  fileSize: number;
}

export interface ValidationResponse extends APIResponse<FileValidation> {
  validationTime: number;
}

// Event types
export interface MapEvent {
  type: 'click' | 'move' | 'zoom' | 'layer-add' | 'layer-remove';
  data: Record<string, unknown>;
  timestamp: Date;
}

export interface LayerEvent {
  type: 'load' | 'error' | 'opacity-change' | 'visibility-change';
  layerId: string;
  data?: Record<string, unknown>;
  timestamp: Date;
}

// Configuration types
export interface AppConfiguration {
  maxFileSize: number; // bytes
  supportedFormats: string[];
  maxConcurrentLayers: number;
  defaultMapCenter: [number, number];
  defaultZoomLevel: number;
  maxZoomLevel: number;
  minZoomLevel: number;
  cacheSize: number; // MB
  enableAnalytics: boolean;
  debugMode: boolean;
  tileServerUrl: string;
  satelliteTileUrl: string;
}

// Error types
export interface AppError extends Error {
  code: string;
  context?: Record<string, unknown>;
  timestamp: Date;
  stack?: string;
}

export class GeoTIFFError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'GeoTIFFError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public issues: ValidationIssue[]
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// State management types (for Zustand)
export interface AppState {
  layers: GeoTIFFLayer[];
  activeLayerId: string | null;
  mapConfiguration: MapConfiguration;
  isLoading: boolean;
  error: string | null;
  performanceMetrics: PerformanceMetrics[];
  cacheStatistics: CacheStatistics;
}

export interface AppActions {
  addLayer: (layer: GeoTIFFLayer) => void;
  removeLayer: (layerId: string) => void;
  updateLayer: (layerId: string, updates: Partial<GeoTIFFLayer>) => void;
  setActiveLayer: (layerId: string | null) => void;
  updateMapConfiguration: (config: Partial<MapConfiguration>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addPerformanceMetric: (metric: PerformanceMetrics) => void;
  updateCacheStatistics: (stats: CacheStatistics) => void;
  clearLayers: () => void;
  resetState: () => void;
}

export type AppStore = AppState & AppActions;