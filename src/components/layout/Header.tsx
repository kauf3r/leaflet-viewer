"use client";

import React, { useState } from 'react';
import { Upload, Settings, Share2, Download, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileUploadDialog } from '@/components/upload/FileUploadDialog';
import { useAppStore } from '@/lib/store';

interface HeaderProps {
  onShare?: () => void;
  onExport?: () => void;
  onSettings?: () => void;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onShare,
  onExport,
  onSettings,
  className,
}) => {
  const { layers, isLoading } = useAppStore();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const hasLayers = layers.length > 0;

  return (
    <Card className={`border-b rounded-none border-l-0 border-r-0 border-t-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className || ''}`}>
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo and Title */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-sm">GT</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">GeoTIFF Viewer</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Photogrammetry visualization tool
              </p>
            </div>
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUploadDialogOpen(true)}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Upload GeoTIFF</span>
          </Button>


          {hasLayers && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onShare}
                className="flex items-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                className="flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </Button>
            </>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onSettings}
            className="flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden lg:inline">Settings</span>
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Menu className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col space-y-4 pt-6">
                <Button
                  variant="outline"
                  onClick={() => setUploadDialogOpen(true)}
                  disabled={isLoading}
                  className="flex items-center justify-start space-x-2 w-full"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload GeoTIFF</span>
                </Button>

                {hasLayers && (
                  <>
                    <Button
                      variant="outline"
                      onClick={onShare}
                      className="flex items-center justify-start space-x-2 w-full"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </Button>

                    <Button
                      variant="outline"
                      onClick={onExport}
                      className="flex items-center justify-start space-x-2 w-full"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export</span>
                    </Button>
                  </>
                )}

                <Button
                  variant="outline"
                  onClick={onSettings}
                  className="flex items-center justify-start space-x-2 w-full"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="h-1 bg-muted">
          <div className="h-full bg-primary animate-pulse" />
        </div>
      )}

      {/* File Upload Dialog */}
      <FileUploadDialog 
        open={uploadDialogOpen} 
        onOpenChange={setUploadDialogOpen} 
      />
    </Card>
  );
};