"use client";

import React from 'react';
import { MapPin, ZoomIn, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useAppStore } from '@/lib/store';

interface StatusBarProps {
  mouseCoordinates?: [number, number] | null;
  className?: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({ 
  mouseCoordinates, 
  className 
}) => {
  const { mapConfiguration, layers, cacheStatistics } = useAppStore();
  const { viewport } = mapConfiguration;
  const visibleLayers = layers.filter(layer => layer.visible);

  const formatCoordinate = (coord: number) => {
    return coord.toFixed(6);
  };

  const formatZoom = (zoom: number) => {
    return zoom.toFixed(1);
  };

  const formatMemoryUsage = (mb: number) => {
    if (mb < 1) return `${(mb * 1024).toFixed(0)} KB`;
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <Card className={`border-t rounded-none border-l-0 border-r-0 border-b-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className || ''}`}>
      <div className="flex items-center justify-between px-4 py-2 text-sm">
        {/* Left side - Coordinates and Zoom */}
        <div className="flex items-center space-x-6">
          {/* Mouse Coordinates */}
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {mouseCoordinates ? (
                `${formatCoordinate(mouseCoordinates[1])}, ${formatCoordinate(mouseCoordinates[0])}`
              ) : (
                'Move mouse over map'
              )}
            </span>
          </div>

          {/* Zoom Level */}
          <div className="flex items-center space-x-2">
            <ZoomIn className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Zoom: {formatZoom(viewport.zoom)}
            </span>
          </div>

          {/* Center Coordinates */}
          <div className="hidden lg:block text-muted-foreground">
            Center: {formatCoordinate(viewport.center[1])}, {formatCoordinate(viewport.center[0])}
          </div>
        </div>

        {/* Right side - Layer and Performance Info */}
        <div className="flex items-center space-x-6">
          {/* Layer Count */}
          <div className="text-muted-foreground">
            Layers: {visibleLayers.length}/{layers.length}
          </div>

          {/* Memory Usage */}
          {cacheStatistics.memoryUsage > 0 && (
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Memory: {formatMemoryUsage(cacheStatistics.memoryUsage)}
              </span>
            </div>
          )}

          {/* Cache Hit Rate */}
          {cacheStatistics.hitRate > 0 && (
            <div className="hidden lg:block text-muted-foreground">
              Cache: {(cacheStatistics.hitRate * 100).toFixed(0)}%
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};