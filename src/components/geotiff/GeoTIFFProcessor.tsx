/**
 * Placeholder for GeoTIFFProcessor component
 * This will be implemented in the GeoTIFF feature development phase
 */

import React from 'react';

interface GeoTIFFProcessorProps {
  className?: string;
}

const GeoTIFFProcessor: React.FC<GeoTIFFProcessorProps> = ({ className }) => {
  return (
    <div className={`p-4 ${className || ''}`}>
      <div className="text-center">
        <h2 className="text-lg font-semibold mb-2">GeoTIFF Processor</h2>
        <p className="text-sm text-muted-foreground">
          Advanced GeoTIFF file processing with GDAL WebAssembly will be implemented here
        </p>
      </div>
    </div>
  );
};

export default GeoTIFFProcessor;