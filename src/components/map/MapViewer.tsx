"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/lib/store';

interface MapViewerProps {
  className?: string;
  onMouseCoordinatesChange?: (coords: [number, number] | null) => void;
}

const MapViewer: React.FC<MapViewerProps> = ({ 
  className, 
  onMouseCoordinatesChange 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { 
    mapConfiguration, 
    layers, 
    updateMapConfiguration 
  } = useAppStore();

  // Dynamic import of Leaflet to avoid SSR issues
  useEffect(() => {
    let mounted = true;

    const initializeMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Dynamic imports for Leaflet
        const L = await import('leaflet');
        // Import CSS as string to avoid TypeScript error
        await import('leaflet/dist/leaflet.css' as any);
        
        // Fix marker icons for Leaflet in Next.js
        const icon = L.icon({
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });
        L.Marker.prototype.options.icon = icon;

        if (!mapRef.current || !mounted) return;

        // Initialize map
        const map = L.map(mapRef.current, {
          center: mapConfiguration.viewport.center,
          zoom: mapConfiguration.viewport.zoom,
          minZoom: mapConfiguration.minZoom,
          maxZoom: mapConfiguration.maxZoom,
          zoomControl: mapConfiguration.controls.zoomControl,
          attributionControl: mapConfiguration.controls.attributionControl,
          preferCanvas: true, // Better performance for large datasets
        });

        // Add base layer
        const activeBaseLayer = mapConfiguration.baseLayers.find(layer => layer.active);
        if (activeBaseLayer) {
          L.tileLayer(activeBaseLayer.url, {
            attribution: activeBaseLayer.attribution,
            maxZoom: activeBaseLayer.maxZoom,
          }).addTo(map);
        }

        // Add scale control if enabled
        if (mapConfiguration.controls.scaleControl) {
          L.control.scale().addTo(map);
        }

        // Mouse coordinate tracking
        const handleMouseMove = (e: any) => {
          if (onMouseCoordinatesChange) {
            onMouseCoordinatesChange([e.latlng.lng, e.latlng.lat]);
          }
        };

        const handleMouseOut = () => {
          if (onMouseCoordinatesChange) {
            onMouseCoordinatesChange(null);
          }
        };

        map.on('mousemove', handleMouseMove);
        map.on('mouseout', handleMouseOut);

        // Map event handlers
        map.on('moveend', () => {
          const center = map.getCenter();
          const zoom = map.getZoom();
          updateMapConfiguration({
            viewport: {
              center: [center.lat, center.lng],
              zoom,
            }
          });
        });

        setMapInstance(map);
        setIsLoading(false);

      } catch (err) {
        console.error('Failed to initialize map:', err);
        if (mounted) {
          setError('Failed to load map. Please refresh the page.');
          setIsLoading(false);
        }
      }
    };

    initializeMap();

    return () => {
      mounted = false;
      if (mapInstance) {
        mapInstance.remove();
        setMapInstance(null);
      }
    };
  }, []);

  // Handle layer updates with proper GeoTIFF rendering
  useEffect(() => {
    if (!mapInstance) return;

    const initializeLayers = async () => {
      const { default: L } = await import('leaflet');
      const layerInstances = new Map();

      // Function to create GeoTIFF layer using georaster for proper rendering
      const createGeoTiffLayer = async (layer: any) => {
        console.log('Creating layer for:', layer.name, 'bounds:', layer.bounds);
        
        try {
          // Get the raw file data directly from the layer instead of using blob URL
          let arrayBuffer: ArrayBuffer;
          
          if (layer.rawData) {
            // Use stored raw data if available
            arrayBuffer = layer.rawData;
          } else {
            // Try to fetch the blob URL (this might fail due to CSP)
            const response = await fetch(layer.url);
            arrayBuffer = await response.arrayBuffer();
          }
          
          // Parse with georaster - the module exports a function directly
          const georasterModule = await import('georaster');
          console.log('Georaster module imported successfully');
          
          // georaster exports a function directly as default or as the module itself
          const parseFunction = (georasterModule as any).default || georasterModule;
          
          if (typeof parseFunction !== 'function') {
            throw new Error('Georaster module did not export a function');
          }
          
          console.log('Parsing georaster with ArrayBuffer of size:', arrayBuffer.byteLength);
          const georaster = await (parseFunction as any)(arrayBuffer);
          
          // Import georaster-layer-for-leaflet dynamically
          const { default: GeoRasterLayer } = await import('georaster-layer-for-leaflet');
          
          console.log('Creating georaster layer with proper rendering');
          
          // Create georaster layer with proper NAIP RGB rendering
          const geoRasterLayer = new GeoRasterLayer({
            georaster,
            opacity: layer.opacity,
            pixelValuesToColorFn: (values: number[]) => {
              // Handle null/undefined values
              if (!values || values.length === 0) return null;
              
              // NAIP imagery typically has RGB bands
              if (values.length >= 3) {
                // RGB rendering
                const r = Math.max(0, Math.min(255, Math.floor(values[0] || 0)));
                const g = Math.max(0, Math.min(255, Math.floor(values[1] || 0)));
                const b = Math.max(0, Math.min(255, Math.floor(values[2] || 0)));
                return `rgb(${r}, ${g}, ${b})`;
              } else {
                // Single band - grayscale
                const value = values[0];
                if (value === undefined || value === null) return null;
                const normalized = Math.max(0, Math.min(255, Math.floor(value)));
                return `rgb(${normalized}, ${normalized}, ${normalized})`;
              }
            },
            resolution: 256, // Tile resolution for performance
          });
          
          return geoRasterLayer;
          
        } catch (error) {
          console.error('Failed to create GeoTIFF layer with georaster:', error);
          
          // Enhanced fallback: Create a styled representation of the GeoTIFF bounds
          const bounds = [
            [layer.bounds.south, layer.bounds.west], 
            [layer.bounds.north, layer.bounds.east]
          ] as L.LatLngBoundsExpression;
          
          console.log('Using enhanced GeoTIFF bounds display with bounds:', bounds);
          
          // Create a more realistic representation
          const rectangle = L.rectangle(bounds, {
            color: '#2563eb',
            weight: 2,
            opacity: layer.opacity,
            fillColor: '#3b82f6',
            fillOpacity: 0.3,
          });
          
          // Add a popup with layer information
          rectangle.bindPopup(`
            <div style="font-family: system-ui; font-size: 14px;">
              <h4 style="margin: 0 0 8px 0; color: #1f2937;">${layer.name}</h4>
              <p style="margin: 4px 0; color: #6b7280;"><strong>Projection:</strong> ${layer.metadata.projection}</p>
              <p style="margin: 4px 0; color: #6b7280;"><strong>Size:</strong> ${layer.metadata.width} × ${layer.metadata.height}</p>
              <p style="margin: 4px 0; color: #6b7280;"><strong>Bands:</strong> ${layer.metadata.samplesPerPixel}</p>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #9ca3af;">Full pixel rendering requires Web Workers (blocked by CSP in development)</p>
            </div>
          `);
          
          return rectangle;
        }
      };

      // Process layers
      const processLayers = async () => {
        for (const layer of layers) {
          if (layer.visible && layer.loadingState === 'loaded') {
            if (!layerInstances.has(layer.id)) {
              try {
                console.log('Processing layer:', layer.name, 'with bounds:', layer.bounds);
                const geoRasterLayer = await createGeoTiffLayer(layer);
                console.log('Created layer, adding to map');
                
                geoRasterLayer.addTo(mapInstance);
                layerInstances.set(layer.id, geoRasterLayer);
                
                console.log('Layer added to map successfully');
                
                // Fit map to layer bounds if it's the first visible layer
                const visibleLayers = layers.filter(l => l.visible && l.loadingState === 'loaded');
                if (visibleLayers.length === 1) {
                  const bounds = [
                    [layer.bounds.south, layer.bounds.west], 
                    [layer.bounds.north, layer.bounds.east]
                  ] as L.LatLngBoundsExpression;
                  console.log('Fitting map to bounds:', bounds);
                  mapInstance.fitBounds(bounds, { padding: [20, 20] });
                }
              } catch (error) {
                console.error('Failed to add layer:', error);
              }
            } else {
              // Update existing layer opacity
              const existingLayer = layerInstances.get(layer.id);
              if (existingLayer && existingLayer.setOpacity) {
                existingLayer.setOpacity(layer.opacity);
              }
            }
          } else {
            // Remove layer if not visible or not loaded
            const existingLayer = layerInstances.get(layer.id);
            if (existingLayer) {
              mapInstance.removeLayer(existingLayer);
              layerInstances.delete(layer.id);
            }
          }
        }
        
        // Remove layers that are no longer in the state
        layerInstances.forEach((layerInstance, layerId) => {
          if (!layers.find(l => l.id === layerId)) {
            mapInstance.removeLayer(layerInstance);
            layerInstances.delete(layerId);
          }
        });
      };

      await processLayers();
    };

    initializeLayers();

  }, [mapInstance, layers]);

  if (error) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-muted ${className || ''}`}>
        <div className="text-center p-8">
          <div className="text-destructive text-lg font-semibold mb-2">Map Error</div>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className || ''}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}
      
      <div 
        ref={mapRef} 
        className="w-full h-full"
        style={{ 
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out'
        }}
      />
    </div>
  );
};

export default MapViewer;