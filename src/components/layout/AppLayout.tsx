"use client";

import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { StatusBar } from './StatusBar';
import MapViewer from '@/components/map/MapViewer';

interface AppLayoutProps {
  children?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [mouseCoordinates, setMouseCoordinates] = useState<[number, number] | null>(null);

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Share clicked');
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export clicked');
  };

  const handleSettings = () => {
    // TODO: Implement settings dialog
    console.log('Settings clicked');
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
          <MapViewer 
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
    </div>
  );
};