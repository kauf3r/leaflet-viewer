"use client";

import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { StatusBar } from './StatusBar';
import { LazyMapViewer } from '@/lib/lazy-imports';
import { ShareDialog } from '@/components/sharing/ShareDialog';
import { ExportDialog } from '@/components/export/ExportDialog';
import { SettingsDialog } from '@/components/settings/SettingsDialog';
import { Toaster } from '@/components/ui/sonner';

interface AppLayoutProps {
  children?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [mouseCoordinates, setMouseCoordinates] = useState<[number, number] | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

  const handleShare = () => {
    setShareDialogOpen(true);
  };

  const handleExport = () => {
    setExportDialogOpen(true);
  };

  const handleSettings = () => {
    setSettingsDialogOpen(true);
  };

  const handleMouseCoordinatesChange = (coords: [number, number] | null) => {
    setMouseCoordinates(coords);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <Header
        onShare={handleShare}
        onExport={handleExport}
        onSettings={handleSettings}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map Container */}
        <div className="flex-1 relative">
          <LazyMapViewer 
            className="w-full h-full"
            onMouseCoordinatesChange={handleMouseCoordinatesChange}
          />
          {children}
        </div>

        {/* Sidebar */}
        <Sidebar />
      </div>

      {/* Status Bar */}
      <StatusBar mouseCoordinates={mouseCoordinates} />
      
      {/* Share Dialog */}
      <ShareDialog 
        open={shareDialogOpen} 
        onOpenChange={setShareDialogOpen} 
      />
      
      {/* Export Dialog */}
      <ExportDialog 
        open={exportDialogOpen} 
        onOpenChange={setExportDialogOpen} 
      />
      
      {/* Settings Dialog */}
      <SettingsDialog 
        open={settingsDialogOpen} 
        onOpenChange={setSettingsDialogOpen} 
      />
      
      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
};