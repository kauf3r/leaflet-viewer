"use client";

import React, { useState, useCallback } from 'react';
import { 
  Ruler, 
  MapPin, 
  Square, 
  Target, 
  Calculator, 
  Eye,
  ChevronDown,
  ChevronRight,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';
import type { AnalysisType, AnalysisResult } from '@/types';

interface AnalysisToolsProps {
  className?: string;
  onToolSelect?: (tool: AnalysisType) => void;
  onAnalysisResult?: (result: AnalysisResult) => void;
}

interface MeasurementResult {
  type: 'distance' | 'area' | 'coordinates';
  value: number;
  unit: string;
  coordinates?: [number, number][];
}

const AnalysisTools: React.FC<AnalysisToolsProps> = ({ 
  className,
  onToolSelect
}) => {
  const { layers, activeLayerId } = useAppStore();
  const [activeTool, setActiveTool] = useState<AnalysisType | null>(null);
  const [measurements, setMeasurements] = useState<MeasurementResult[]>([]);
  const [showResults, setShowResults] = useState(true);
  const [coordinates] = useState<[number, number] | null>(null);

  const activeLayer = layers.find(l => l.id === activeLayerId);

  const handleToolSelect = useCallback((tool: AnalysisType) => {
    setActiveTool(tool);
    onToolSelect?.(tool);
  }, [onToolSelect]);

  const formatCoordinate = (coord: number) => {
    return coord.toFixed(6);
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${meters.toFixed(2)} m`;
    }
    return `${(meters / 1000).toFixed(2)} km`;
  };

  const formatArea = (squareMeters: number) => {
    if (squareMeters < 10000) {
      return `${squareMeters.toFixed(2)} m²`;
    } else if (squareMeters < 1000000) {
      return `${(squareMeters / 10000).toFixed(2)} ha`;
    }
    return `${(squareMeters / 1000000).toFixed(2)} km²`;
  };

  const clearMeasurements = () => {
    setMeasurements([]);
    setActiveTool(null);
  };

  return (
    <div className={`w-80 h-full bg-background border-l flex flex-col ${className || ''}`}>
      <Card className="flex-1 rounded-none border-0 border-b">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Analysis Tools
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Tabs defaultValue="measurement" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="measurement">Measurement</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            </TabsList>
            
            <TabsContent value="measurement" className="space-y-3">
              {/* Coordinate Display */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Current Position
                </h4>
                <div className="bg-muted p-2 rounded text-sm font-mono">
                  {coordinates ? (
                    <div>
                      <div>Lat: {formatCoordinate(coordinates[1])}</div>
                      <div>Lng: {formatCoordinate(coordinates[0])}</div>
                    </div>
                  ) : (
                    <div className="text-muted-foreground">Move cursor over map</div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Measurement Tools */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Measurement Tools</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={activeTool === 'point-query' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleToolSelect('point-query')}
                    className="flex items-center gap-2"
                  >
                    <Target className="h-4 w-4" />
                    Point
                  </Button>
                  
                  <Button
                    variant={activeTool === 'line-profile' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleToolSelect('line-profile')}
                    className="flex items-center gap-2"
                    disabled
                  >
                    <Ruler className="h-4 w-4" />
                    Distance
                  </Button>
                  
                  <Button
                    variant={activeTool === 'area-statistics' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleToolSelect('area-statistics')}
                    className="flex items-center gap-2"
                    disabled
                  >
                    <Square className="h-4 w-4" />
                    Area
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearMeasurements}
                    className="flex items-center gap-2"
                  >
                    Clear
                  </Button>
                </div>
              </div>

              {/* Active Layer Info */}
              {activeLayer && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Active Layer
                    </h4>
                    <div className="bg-muted p-2 rounded text-sm">
                      <div className="font-medium truncate">{activeLayer.name}</div>
                      <div className="text-muted-foreground text-xs mt-1">
                        {activeLayer.metadata.width} × {activeLayer.metadata.height} pixels
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {activeLayer.metadata.projection || 'Unknown projection'}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="analysis" className="space-y-3">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Raster Analysis</h4>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToolSelect('histogram')}
                    disabled
                    className="flex items-center gap-2 justify-start"
                  >
                    <Calculator className="h-4 w-4" />
                    Histogram
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToolSelect('contours')}
                    disabled
                    className="flex items-center gap-2 justify-start"
                  >
                    <Target className="h-4 w-4" />
                    Contours
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToolSelect('slope')}
                    disabled
                    className="flex items-center gap-2 justify-start"
                  >
                    <Ruler className="h-4 w-4" />
                    Slope Analysis
                  </Button>
                </div>
                
                <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
                  <Info className="h-3 w-3 inline mr-1" />
                  Advanced analysis tools will be enabled with GDAL processing
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Results Panel */}
      {measurements.length > 0 && (
        <Card className="rounded-none border-0 border-t">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Results</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowResults(!showResults)}
                className="h-6 w-6 p-0"
              >
                {showResults ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          
          {showResults && (
            <CardContent className="pt-0 space-y-2 max-h-40 overflow-y-auto">
              {measurements.map((measurement, index) => (
                <div key={index} className="bg-muted p-2 rounded text-sm">
                  <div className="font-medium capitalize">{measurement.type}</div>
                  <div className="text-muted-foreground">
                    {measurement.value} {measurement.unit}
                  </div>
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      )}

      {/* Instructions */}
      <div className="p-3 border-t bg-muted/30">
        <div className="text-xs text-muted-foreground">
          {activeTool === 'point-query' && (
            <div>Click on the map to query raster values at a point</div>
          )}
          {activeTool === 'line-profile' && (
            <div>Click to start, then click to add points. Double-click to finish.</div>
          )}
          {activeTool === 'area-statistics' && (
            <div>Click to start drawing an area. Double-click to close polygon.</div>
          )}
          {!activeTool && (
            <div>Select a measurement tool to begin analysis</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisTools;