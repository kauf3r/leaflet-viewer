import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  AppStore,
  GeoTIFFLayer,
  MapConfiguration,
  MapViewport,
  PerformanceMetrics,
  CacheStatistics
} from '@/types';

const DEFAULT_VIEWPORT: MapViewport = {
  center: [0, 0],
  zoom: 2,
};

const DEFAULT_MAP_CONFIG: MapConfiguration = {
  viewport: DEFAULT_VIEWPORT,
  controls: {
    zoomControl: true,
    scaleControl: true,
    attributionControl: true,
    fullscreenControl: true,
    measureControl: false,
    layerControl: true,
  },
  baseLayers: [
    {
      id: 'osm',
      name: 'OpenStreetMap',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
      type: 'tile',
      active: true,
    },
    {
      id: 'satellite',
      name: 'Satellite',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '© Esri',
      maxZoom: 19,
      type: 'tile',
      active: false,
    },
  ],
  overlayLayers: [],
  maxZoom: 22,
  minZoom: 1,
};

const DEFAULT_CACHE_STATS: CacheStatistics = {
  size: 0,
  entries: 0,
  hitRate: 0,
  memoryUsage: 0,
};

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // State
        layers: [],
        activeLayerId: null,
        mapConfiguration: DEFAULT_MAP_CONFIG,
        isLoading: false,
        error: null,
        performanceMetrics: [],
        cacheStatistics: DEFAULT_CACHE_STATS,

        // Actions
        addLayer: (layer: GeoTIFFLayer) =>
          set((state) => {
            // Check if layer with same ID exists
            const existingIndex = state.layers.findIndex(l => l.id === layer.id);
            if (existingIndex >= 0) {
              state.layers[existingIndex] = layer;
            } else {
              state.layers.push(layer);
            }
            
            // Update map configuration overlay layers
            state.mapConfiguration.overlayLayers = state.layers;
            
            // Set as active if it's the first layer
            if (state.layers.length === 1) {
              state.activeLayerId = layer.id;
            }
          }),

        removeLayer: (layerId: string) =>
          set((state) => {
            state.layers = state.layers.filter(layer => layer.id !== layerId);
            state.mapConfiguration.overlayLayers = state.layers;
            
            // Update active layer if removed
            if (state.activeLayerId === layerId) {
              state.activeLayerId = state.layers.length > 0 ? (state.layers[0]?.id || null) : null;
            }
          }),

        updateLayer: (layerId: string, updates: Partial<GeoTIFFLayer>) =>
          set((state) => {
            const layerIndex = state.layers.findIndex(layer => layer.id === layerId);
            if (layerIndex >= 0) {
              const existingLayer = state.layers[layerIndex];
              if (existingLayer) {
                state.layers[layerIndex] = {
                  ...existingLayer,
                  ...updates,
                };
                state.mapConfiguration.overlayLayers = state.layers;
              }
            }
          }),

        setActiveLayer: (layerId: string | null) =>
          set((state) => {
            if (layerId === null || state.layers.some(layer => layer.id === layerId)) {
              state.activeLayerId = layerId;
            }
          }),

        updateMapConfiguration: (config: Partial<MapConfiguration>) =>
          set((state) => {
            state.mapConfiguration = {
              ...state.mapConfiguration,
              ...config,
              viewport: config.viewport
                ? { ...state.mapConfiguration.viewport, ...config.viewport }
                : state.mapConfiguration.viewport,
              controls: config.controls
                ? { ...state.mapConfiguration.controls, ...config.controls }
                : state.mapConfiguration.controls,
            };
          }),

        setLoading: (loading: boolean) =>
          set((state) => {
            state.isLoading = loading;
          }),

        setError: (error: string | null) =>
          set((state) => {
            state.error = error;
          }),

        addPerformanceMetric: (metric: PerformanceMetrics) =>
          set((state) => {
            state.performanceMetrics.push(metric);
            // Keep only last 100 metrics
            if (state.performanceMetrics.length > 100) {
              state.performanceMetrics = state.performanceMetrics.slice(-100);
            }
          }),

        updateCacheStatistics: (stats: CacheStatistics) =>
          set((state) => {
            state.cacheStatistics = stats;
          }),

        clearLayers: () =>
          set((state) => {
            state.layers = [];
            state.activeLayerId = null;
            state.mapConfiguration.overlayLayers = [];
          }),

        resetState: () =>
          set(() => ({
            layers: [],
            activeLayerId: null,
            mapConfiguration: DEFAULT_MAP_CONFIG,
            isLoading: false,
            error: null,
            performanceMetrics: [],
            cacheStatistics: DEFAULT_CACHE_STATS,
          })),
      })),
      {
        name: 'leaflet-viewer-storage',
        partialize: (state) => ({
          // Only persist map configuration and performance metrics
          mapConfiguration: state.mapConfiguration,
          performanceMetrics: state.performanceMetrics.slice(-20), // Keep last 20 metrics
        }),
      }
    ),
    {
      name: 'LeafletViewerStore',
    }
  )
);

// Selectors
export const selectLayers = (state: AppStore) => state.layers;
export const selectActiveLayer = (state: AppStore) => 
  state.layers.find(layer => layer.id === state.activeLayerId);
export const selectVisibleLayers = (state: AppStore) => 
  state.layers.filter(layer => layer.visible);
export const selectMapViewport = (state: AppStore) => state.mapConfiguration.viewport;
export const selectActiveBaseLayer = (state: AppStore) => 
  state.mapConfiguration.baseLayers.find(layer => layer.active);