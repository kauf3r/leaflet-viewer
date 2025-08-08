"use client";

import React, { useState, useCallback } from 'react';
import { FileUp, Settings, Zap, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/lib/store';
import { geoTIFFProcessor, ProcessingOptions } from '@/lib/geotiff-processor';

interface GeoTIFFProcessorProps {
  className?: string;
}

interface ProcessingJob {
  id: string;
  file: File;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
  startTime?: number;
  endTime?: number;
}

const GeoTIFFProcessor: React.FC<GeoTIFFProcessorProps> = ({ className }) => {
  const [processingJobs, setProcessingJobs] = useState<ProcessingJob[]>([]);
  const [processingOptions, setProcessingOptions] = useState<ProcessingOptions>({
    generateThumbnail: true,
    quality: 'medium'
  });
  const { addLayer, layers } = useAppStore();

  const processFile = useCallback(async (file: File) => {
    const jobId = `${file.name}-${Date.now()}`;
    const newJob: ProcessingJob = {
      id: jobId,
      file,
      status: 'pending',
      progress: 0,
      startTime: Date.now()
    };

    setProcessingJobs(prev => [...prev, newJob]);

    try {
      // Update to processing status
      setProcessingJobs(prev => 
        prev.map(job => 
          job.id === jobId 
            ? { ...job, status: 'processing', progress: 10 }
            : job
        )
      );

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProcessingJobs(prev => 
          prev.map(job => 
            job.id === jobId && job.status === 'processing'
              ? { ...job, progress: Math.min(job.progress + 10, 90) }
              : job
          )
        );
      }, 200);

      // Process the file
      const result = await geoTIFFProcessor.processFile(file, processingOptions);
      
      clearInterval(progressInterval);

      // Add to store
      addLayer(result.layer);

      // Update to completed status
      setProcessingJobs(prev => 
        prev.map(job => 
          job.id === jobId 
            ? { 
                ...job, 
                status: 'completed', 
                progress: 100, 
                endTime: Date.now() 
              }
            : job
        )
      );

    } catch (error) {
      setProcessingJobs(prev => 
        prev.map(job => 
          job.id === jobId 
            ? { 
                ...job, 
                status: 'error', 
                error: error instanceof Error ? error.message : 'Unknown error',
                endTime: Date.now()
              }
            : job
        )
      );
    }
  }, [processingOptions, addLayer]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    files.forEach(processFile);
    event.target.value = '';
  }, [processFile]);

  const removeJob = useCallback((jobId: string) => {
    setProcessingJobs(prev => prev.filter(job => job.id !== jobId));
  }, []);

  const clearCompletedJobs = useCallback(() => {
    setProcessingJobs(prev => prev.filter(job => job.status === 'processing' || job.status === 'pending'));
  }, []);

  const retryJob = useCallback((job: ProcessingJob) => {
    processFile(job.file);
    removeJob(job.id);
  }, [processFile, removeJob]);

  const getStatusIcon = (status: ProcessingJob['status']) => {
    switch (status) {
      case 'pending':
      case 'processing':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const formatDuration = (startTime: number, endTime?: number) => {
    const duration = (endTime || Date.now()) - startTime;
    return `${(duration / 1000).toFixed(1)}s`;
  };

  return (
    <div className={`space-y-4 ${className || ''}`}>
      {/* Processing Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Processing Options
          </CardTitle>
          <CardDescription>
            Configure how GeoTIFF files are processed and displayed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="thumbnail">Generate Thumbnails</Label>
            <Switch
              id="thumbnail"
              checked={processingOptions.generateThumbnail}
              onCheckedChange={(checked) =>
                setProcessingOptions(prev => ({ ...prev, generateThumbnail: checked }))
              }
            />
          </div>
          
          <div className="space-y-2">
            <Label>Processing Quality</Label>
            <Select
              value={processingOptions.quality}
              onValueChange={(value: 'low' | 'medium' | 'high') =>
                setProcessingOptions(prev => ({ ...prev, quality: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low (Fast)</SelectItem>
                <SelectItem value="medium">Medium (Balanced)</SelectItem>
                <SelectItem value="high">High (Quality)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* File Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileUp className="h-5 w-5" />
            Upload GeoTIFF Files
          </CardTitle>
          <CardDescription>
            Select .tif, .tiff, or .gtiff files to process (max 1GB each)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <input
              type="file"
              id="geotiff-upload"
              multiple
              accept=".tif,.tiff,.gtiff"
              onChange={handleFileSelect}
              className="hidden"
            />
            <label
              htmlFor="geotiff-upload"
              className="cursor-pointer"
            >
              <FileUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm font-medium">Click to select GeoTIFF files</p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports .tif, .tiff, .gtiff formats up to 1GB
              </p>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Processing Queue */}
      {processingJobs.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Processing Queue ({processingJobs.length})
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={clearCompletedJobs}
                disabled={!processingJobs.some(job => job.status === 'completed' || job.status === 'error')}
              >
                Clear Completed
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {processingJobs.map(job => (
              <div key={job.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(job.status)}
                    <span className="font-medium text-sm truncate max-w-[200px]">
                      {job.file.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {job.startTime && (
                      <span className="text-xs text-muted-foreground">
                        {formatDuration(job.startTime, job.endTime)}
                      </span>
                    )}
                    {job.status === 'error' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => retryJob(job)}
                      >
                        Retry
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeJob(job.id)}
                    >
                      ×
                    </Button>
                  </div>
                </div>
                
                {job.status === 'processing' && (
                  <Progress value={job.progress} className="h-2" />
                )}
                
                {job.error && (
                  <p className="text-xs text-red-600 mt-1">{job.error}</p>
                )}
                
                {job.status === 'completed' && (
                  <p className="text-xs text-green-600 mt-1">
                    Successfully processed and added to map
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Current Layers Summary */}
      {layers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active Layers ({layers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {layers.slice(0, 3).map(layer => (
                <div key={layer.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{layer.name}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    layer.loadingState === 'loaded' ? 'bg-green-100 text-green-700' :
                    layer.loadingState === 'loading' ? 'bg-blue-100 text-blue-700' :
                    layer.loadingState === 'error' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {layer.loadingState}
                  </span>
                </div>
              ))}
              {layers.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{layers.length - 3} more layers
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GeoTIFFProcessor;