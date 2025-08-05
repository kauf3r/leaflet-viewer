/**
 * Lazy loading utilities for GeoTIFF components
 * Ensures heavy mapping libraries only load when needed
 */

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// Note: All major components now have real implementations

// Lazy load the main map component (will fallback to placeholder until component exists)
export const LazyMapViewer = dynamic(
  () => import('@/components/map/MapViewer'),
  {
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading Map...</p>
        </div>
      </div>
    ),
    ssr: false, // Leaflet requires client-side rendering
  }
);

// Lazy load GeoTIFF processor (heavy GDAL WebAssembly)
export const LazyGeoTIFFProcessor = dynamic(
  () => import('@/components/geotiff/GeoTIFFProcessor'),
  {
    loading: () => (
      <div className="text-center p-4">
        <div className="animate-pulse">Loading GeoTIFF processor...</div>
      </div>
    ),
    ssr: false,
  }
);

// Lazy load layer management panel
export const LazyLayerPanel = dynamic(
  () => import('@/components/layers/LayerPanel'),
  {
    loading: () => <div className="w-64 h-full bg-muted animate-pulse"></div>,
    ssr: false,
  }
);

// Lazy load analysis tools (only when user opens them)
export const LazyAnalysisTools = dynamic(
  () => import('@/components/analysis/AnalysisTools'),
  {
    loading: () => (
      <div className="p-4">
        <div className="animate-pulse bg-muted h-32 rounded"></div>
      </div>
    ),
    ssr: false,
  }
);

// Progressive enhancement wrapper
export function withProgressiveEnhancement<T extends object>(
  Component: ComponentType<T>
) {
  return dynamic(() => Promise.resolve(Component), {
    loading: () => null,
    ssr: true,
  });
}

// Preload critical components when user hovers over trigger
export const preloadMapComponents = (): void => {
  // Preload existing components (these should load successfully)
  import('@/components/map/MapViewer').catch(() => console.warn('Failed to preload MapViewer'));
  import('@/components/layers/LayerPanel').catch(() => console.warn('Failed to preload LayerPanel'));
};

// Preload heavy processing when file is selected
export const preloadGeoTIFFProcessor = (): void => {
  // Preload the actual GeoTIFFProcessor component
  import('@/components/geotiff/GeoTIFFProcessor').catch(() => console.warn('Failed to preload GeoTIFFProcessor'));
  // GDAL worker not yet implemented
  import('@/lib/gdal-worker').catch(() => console.info('GDAL worker not yet implemented'));
};