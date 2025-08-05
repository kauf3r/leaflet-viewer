"use client";

import React, { useState, useCallback } from 'react';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/lib/store';
import { geoTIFFProcessor } from '@/lib/geotiff-processor';

interface FileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UploadFile {
  file: File;
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
}

export const FileUploadDialog: React.FC<FileUploadDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const { addLayer, setLoading, setError } = useAppStore();

  const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1GB
  const ACCEPTED_TYPES = ['.tif', '.tiff', '.gtiff'];

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds 1GB limit (${(file.size / 1024 / 1024).toFixed(1)}MB)`;
    }

    // Check file extension
    const extension = file.name.toLowerCase().split('.').pop();
    if (!extension || !ACCEPTED_TYPES.includes(`.${extension}`)) {
      return `Unsupported file type. Please upload GeoTIFF files (.tif, .tiff, .gtiff)`;
    }

    return null;
  };

  const processFile = async (uploadFile: UploadFile) => {
    try {
      // Set global loading state
      setLoading(true);
      setError(null);
      
      setUploadFiles(prev => 
        prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, status: 'processing', progress: 0 }
            : f
        )
      );

      // Simulate progress during processing
      const progressInterval = setInterval(() => {
        setUploadFiles(prev => 
          prev.map(f => 
            f.id === uploadFile.id && f.progress < 90
              ? { ...f, progress: f.progress + 10 }
              : f
          )
        );
      }, 100);

      // Process the file using our GeoTIFF processor
      const result = await geoTIFFProcessor.processFile(uploadFile.file, {
        generateThumbnail: true,
        quality: 'medium',
      });

      clearInterval(progressInterval);

      // Add the processed layer to the store
      addLayer(result.layer);

      setUploadFiles(prev => 
        prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, status: 'completed', progress: 100 }
            : f
        )
      );
      
      // Clear global loading state on success
      setLoading(false);

    } catch (error) {
      console.error('File processing failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Processing failed';
      
      // Set global error state
      setLoading(false);
      setError(`Failed to process ${uploadFile.file.name}: ${errorMessage}`);
      
      setUploadFiles(prev => 
        prev.map(f => 
          f.id === uploadFile.id 
            ? { 
                ...f, 
                status: 'error', 
                error: errorMessage
              }
            : f
        )
      );
    }
  };

  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    fileArray.forEach(file => {
      const validation = validateFile(file);
      const uploadFile: UploadFile = {
        file,
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: validation ? 'error' : 'pending',
        progress: 0,
        error: validation || undefined,
      };

      setUploadFiles(prev => [...prev, uploadFile]);

      if (!validation) {
        processFile(uploadFile);
      }
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const removeFile = (id: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearCompleted = () => {
    setUploadFiles(prev => prev.filter(f => f.status !== 'completed'));
  };

  const hasCompleted = uploadFiles.some(f => f.status === 'completed');
  const isProcessing = uploadFiles.some(f => f.status === 'processing');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Upload GeoTIFF Files</DialogTitle>
          <DialogDescription>
            Upload your GeoTIFF files to visualize them on the map. Supported formats: .tif, .tiff, .gtiff
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Drop Zone */}
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${isDragOver 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              {isDragOver ? 'Drop files here' : 'Drag & drop GeoTIFF files'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse files
            </p>
            <input
              type="file"
              multiple
              accept=".tif,.tiff,.gtiff"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <Button asChild variant="outline">
              <label htmlFor="file-upload" className="cursor-pointer">
                Browse Files
              </label>
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Maximum file size: 1GB per file
            </p>
          </div>

          {/* File List */}
          {uploadFiles.length > 0 && (
            <div className="flex-1 overflow-y-auto space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Upload Progress</h4>
                {hasCompleted && (
                  <Button variant="outline" size="sm" onClick={clearCompleted}>
                    Clear Completed
                  </Button>
                )}
              </div>
              
              <div className="space-y-2">
                {uploadFiles.map((uploadFile) => (
                  <div key={uploadFile.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-medium truncate">
                          {uploadFile.file.name}
                        </h5>
                        <p className="text-xs text-muted-foreground">
                          {(uploadFile.file.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-2">
                        {uploadFile.status === 'completed' && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        {uploadFile.status === 'error' && (
                          <AlertCircle className="w-4 h-4 text-destructive" />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(uploadFile.id)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {uploadFile.status === 'processing' && (
                      <Progress value={uploadFile.progress} className="h-2" />
                    )}

                    {uploadFile.error && (
                      <p className="text-xs text-destructive mt-1">
                        {uploadFile.error}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {uploadFiles.length} file{uploadFiles.length !== 1 ? 's' : ''} selected
          </p>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {isProcessing ? 'Close' : 'Cancel'}
            </Button>
            {hasCompleted && (
              <Button onClick={() => onOpenChange(false)}>
                Done
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};