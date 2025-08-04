/**
 * Placeholder for MapViewer component
 * This will be implemented in the GeoTIFF feature development phase
 */

import React from 'react';

interface MapViewerProps {
  className?: string;
}

const MapViewer: React.FC<MapViewerProps> = ({ className }) => {
  return (
    <div className={`w-full h-full flex items-center justify-center bg-muted ${className || ''}`}>
      <div className="text-center">
        <h2 className="text-lg font-semibold mb-2">Map Viewer</h2>
        <p className="text-sm text-muted-foreground">
          Interactive Leaflet map component will be implemented here
        </p>
      </div>
    </div>
  );
};

export default MapViewer;