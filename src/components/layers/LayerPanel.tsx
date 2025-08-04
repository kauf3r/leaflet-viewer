"use client";

import React from 'react';
import { Eye, EyeOff, X, Image, Info, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore, selectLayers, selectActiveLayer } from '@/lib/store';
import type { GeoTIFFLayer } from '@/types';

interface LayerPanelProps {
  className?: string;
}

interface LayerItemProps {
  layer: GeoTIFFLayer;
  isActive: boolean;
  onToggleVisibility: (layerId: string) => void;
  onOpacityChange: (layerId: string, opacity: number) => void;
  onRemove: (layerId: string) => void;
  onSetActive: (layerId: string) => void;
}

const LayerItem: React.FC<LayerItemProps> = ({
  layer,
  isActive,
  onToggleVisibility,
  onOpacityChange,
  onRemove,
  onSetActive,
}) => {
  const [showDetails, setShowDetails] = React.useState(false);
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const formatCoordinate = (coord: number) => {
    return coord.toFixed(6);
  };

  return (
    <Card className={`mb-2 ${isActive ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="h-6 w-6 p-0"
            >
              {showDetails ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </Button>
            
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              {layer.thumbnail ? (
                <img 
                  src={layer.thumbnail} 
                  alt={layer.name}
                  className="w-8 h-8 rounded object-cover bg-muted"
                />
              ) : (
                <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                  <Image className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <CardTitle 
                  className="text-sm font-medium truncate cursor-pointer hover:text-primary"
                  onClick={() => onSetActive(layer.id)}
                  title={layer.name}
                >
                  {layer.name}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {layer.metadata.width} × {layer.metadata.height}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleVisibility(layer.id)}
              className="h-6 w-6 p-0"
              title={layer.visible ? 'Hide layer' : 'Show layer'}
            >
              {layer.visible ? (
                <Eye className="h-3 w-3" />
              ) : (
                <EyeOff className="h-3 w-3 text-muted-foreground" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(layer.id)}
              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
              title="Remove layer"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Opacity Control */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium">Opacity</label>
            <span className="text-xs text-muted-foreground">
              {Math.round(layer.opacity * 100)}%
            </span>
          </div>
          <Slider
            value={[layer.opacity * 100]}
            onValueChange={([value]) => onOpacityChange(layer.id, (value || 0) / 100)}
            max={100}
            min={0}
            step={1}
            className="w-full"
          />
        </div>
        
        {/* Loading State */}
        {layer.loadingState === 'loading' && (
          <div className="text-xs text-muted-foreground mb-2">
            Loading...
          </div>
        )}
        
        {layer.loadingState === 'error' && (
          <div className="text-xs text-destructive mb-2">
            Error: {layer.error || 'Failed to load'}
          </div>
        )}
        
        {/* Detailed Information */}
        {showDetails && (
          <div className="space-y-2 pt-2 border-t">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-medium">Size:</span>
                <br />
                <span className="text-muted-foreground">
                  {formatFileSize(layer.metadata.fileSize)}
                </span>
              </div>
              <div>
                <span className="font-medium">Projection:</span>
                <br />
                <span className="text-muted-foreground">
                  {layer.metadata.projection || 'Unknown'}
                </span>
              </div>
            </div>
            
            <div className="text-xs">
              <span className="font-medium">Bounds:</span>
              <div className="text-muted-foreground mt-1 space-y-1">
                <div>N: {formatCoordinate(layer.bounds.north)}</div>
                <div>S: {formatCoordinate(layer.bounds.south)}</div>
                <div>E: {formatCoordinate(layer.bounds.east)}</div>
                <div>W: {formatCoordinate(layer.bounds.west)}</div>
              </div>
            </div>
            
            {layer.metadata.resolution && (
              <div className="text-xs">
                <span className="font-medium">Resolution:</span>
                <br />
                <span className="text-muted-foreground">
                  {layer.metadata.resolution[0].toFixed(6)}, {layer.metadata.resolution[1].toFixed(6)}
                </span>
              </div>
            )}
            
            <div className="text-xs">
              <span className="font-medium">Bands:</span>
              <br />
              <span className="text-muted-foreground">
                {layer.metadata.samplesPerPixel} band{layer.metadata.samplesPerPixel !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const LayerPanel: React.FC<LayerPanelProps> = ({ className }) => {
  const { 
    layers, 
    activeLayerId, 
    updateLayer, 
    removeLayer, 
    setActiveLayer 
  } = useAppStore();
  
  const visibleLayers = layers.filter(layer => layer.visible);
  const hiddenLayers = layers.filter(layer => !layer.visible);
  
  const handleToggleVisibility = (layerId: string) => {
    const layer = layers.find(l => l.id === layerId);
    if (layer) {
      updateLayer(layerId, { visible: !layer.visible });
    }
  };
  
  const handleOpacityChange = (layerId: string, opacity: number) => {
    updateLayer(layerId, { opacity });
  };
  
  const handleRemove = (layerId: string) => {
    removeLayer(layerId);
  };
  
  const handleSetActive = (layerId: string) => {
    setActiveLayer(layerId);
  };

  if (layers.length === 0) {
    return (
      <div className={`w-80 h-full bg-background border-l flex items-center justify-center ${className || ''}`}>
        <div className="text-center p-6">
          <Image className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Layers</h3>
          <p className="text-sm text-muted-foreground">
            Upload GeoTIFF files to start visualizing your data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-80 h-full bg-background border-l flex flex-col ${className || ''}`}>
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center">
          <Image className="w-5 h-5 mr-2" />
          Layers
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {layers.length} layer{layers.length !== 1 ? 's' : ''} • {visibleLayers.length} visible
        </p>
      </div>
      
      {/* Layer List */}
      <div className="flex-1 overflow-y-auto p-4">
        {layers.map((layer) => (
          <LayerItem
            key={layer.id}
            layer={layer}
            isActive={layer.id === activeLayerId}
            onToggleVisibility={handleToggleVisibility}
            onOpacityChange={handleOpacityChange}
            onRemove={handleRemove}
            onSetActive={handleSetActive}
          />
        ))}
      </div>
    </div>
  );
};

export default LayerPanel;