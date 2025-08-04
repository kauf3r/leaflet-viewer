/**
 * Placeholder for LayerPanel component
 * This will be implemented in the GeoTIFF feature development phase
 */

import React from 'react';

interface LayerPanelProps {
  className?: string;
}

const LayerPanel: React.FC<LayerPanelProps> = ({ className }) => {
  return (
    <div className={`w-64 h-full bg-muted flex items-center justify-center ${className || ''}`}>
      <div className="text-center p-4">
        <h2 className="text-lg font-semibold mb-2">Layer Panel</h2>
        <p className="text-sm text-muted-foreground">
          Interactive layer management panel will be implemented here
        </p>
      </div>
    </div>
  );
};

export default LayerPanel;