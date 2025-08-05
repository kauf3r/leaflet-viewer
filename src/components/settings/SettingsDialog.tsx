"use client";

import React, { useState, useEffect } from 'react';
import { Settings, Monitor, Sun, Moon, Map, Zap, Palette } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  basemap: 'osm' | 'satellite' | 'terrain';
  performance: {
    enableHardwareAcceleration: boolean;
    maxMemoryUsage: number;
    tileQuality: 'low' | 'medium' | 'high';
  };
  ui: {
    showCoordinates: boolean;
    showLayerThumbnails: boolean;
    compactMode: boolean;
    animations: boolean;
  };
  processing: {
    maxFileSize: number;
    thumbnailGeneration: boolean;
    autoFitBounds: boolean;
  };
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'system',
    basemap: 'osm',
    performance: {
      enableHardwareAcceleration: true,
      maxMemoryUsage: 2048,
      tileQuality: 'medium',
    },
    ui: {
      showCoordinates: true,
      showLayerThumbnails: true,
      compactMode: false,
      animations: true,
    },
    processing: {
      maxFileSize: 1024,
      thumbnailGeneration: true,
      autoFitBounds: true,
    },
  });

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('geotiff-viewer-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }, []);

  const updateSettings = (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    
    // Save to localStorage
    localStorage.setItem('geotiff-viewer-settings', JSON.stringify(newSettings));
  };

  const updateNestedSettings = <T extends keyof AppSettings>(
    category: T,
    updates: Partial<AppSettings[T]>
  ) => {
    const currentCategorySettings = settings[category] as Record<string, any>;
    const newSettings = {
      ...settings,
      [category]: { ...currentCategorySettings, ...updates }
    } as AppSettings;
    setSettings(newSettings);
    localStorage.setItem('geotiff-viewer-settings', JSON.stringify(newSettings));
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    updateSettings({ theme: newTheme as 'light' | 'dark' | 'system' });
  };

  const resetSettings = () => {
    const defaultSettings: AppSettings = {
      theme: 'system',
      basemap: 'osm',
      performance: {
        enableHardwareAcceleration: true,
        maxMemoryUsage: 2048,
        tileQuality: 'medium',
      },
      ui: {
        showCoordinates: true,
        showLayerThumbnails: true,
        compactMode: false,
        animations: true,
      },
      processing: {
        maxFileSize: 1024,
        thumbnailGeneration: true,
        autoFitBounds: true,
      },
    };
    
    setSettings(defaultSettings);
    setTheme('system');
    localStorage.setItem('geotiff-viewer-settings', JSON.stringify(defaultSettings));
    toast.success('Settings reset to defaults');
  };

  const exportSettings = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `geotiff-viewer-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Settings exported successfully');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Application Settings
          </DialogTitle>
          <DialogDescription>
            Customize your GeoTIFF Viewer experience and preferences
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="appearance" className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="interface">Interface</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto max-h-[60vh] mt-4">
            <TabsContent value="appearance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Theme Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Color Theme</Label>
                    <Select value={theme} onValueChange={handleThemeChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center gap-2">
                            <Sun className="w-4 h-4" />
                            Light
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center gap-2">
                            <Moon className="w-4 h-4" />
                            Dark
                          </div>
                        </SelectItem>
                        <SelectItem value="system">
                          <div className="flex items-center gap-2">
                            <Monitor className="w-4 h-4" />
                            System
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Base Map</Label>
                    <Select 
                      value={settings.basemap} 
                      onValueChange={(value: 'osm' | 'satellite' | 'terrain') => 
                        updateSettings({ basemap: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="osm">OpenStreetMap</SelectItem>
                        <SelectItem value="satellite">Satellite</SelectItem>
                        <SelectItem value="terrain">Terrain</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Performance Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Hardware Acceleration</Label>
                      <p className="text-xs text-muted-foreground">
                        Use GPU for rendering when available
                      </p>
                    </div>
                    <Switch
                      checked={settings.performance.enableHardwareAcceleration}
                      onCheckedChange={(checked) =>
                        updateNestedSettings('performance', { enableHardwareAcceleration: checked })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tile Quality</Label>
                    <Select 
                      value={settings.performance.tileQuality} 
                      onValueChange={(value: 'low' | 'medium' | 'high') =>
                        updateNestedSettings('performance', { tileQuality: value })
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

                  <div className="space-y-2">
                    <Label>Max Memory Usage (MB)</Label>
                    <Select 
                      value={settings.performance.maxMemoryUsage.toString()} 
                      onValueChange={(value) =>
                        updateNestedSettings('performance', { maxMemoryUsage: parseInt(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1024">1 GB</SelectItem>
                        <SelectItem value="2048">2 GB</SelectItem>
                        <SelectItem value="4096">4 GB</SelectItem>
                        <SelectItem value="8192">8 GB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="interface" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    Interface Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Show Coordinates</Label>
                      <p className="text-xs text-muted-foreground">
                        Display mouse coordinates in status bar
                      </p>
                    </div>
                    <Switch
                      checked={settings.ui.showCoordinates}
                      onCheckedChange={(checked) =>
                        updateNestedSettings('ui', { showCoordinates: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Layer Thumbnails</Label>
                      <p className="text-xs text-muted-foreground">
                        Generate thumbnails for uploaded layers
                      </p>
                    </div>
                    <Switch
                      checked={settings.ui.showLayerThumbnails}
                      onCheckedChange={(checked) =>
                        updateNestedSettings('ui', { showLayerThumbnails: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Compact Mode</Label>
                      <p className="text-xs text-muted-foreground">
                        Reduce padding and spacing
                      </p>
                    </div>
                    <Switch
                      checked={settings.ui.compactMode}
                      onCheckedChange={(checked) =>
                        updateNestedSettings('ui', { compactMode: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Animations</Label>
                      <p className="text-xs text-muted-foreground">
                        Enable smooth transitions and animations
                      </p>
                    </div>
                    <Switch
                      checked={settings.ui.animations}
                      onCheckedChange={(checked) =>
                        updateNestedSettings('ui', { animations: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="processing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Map className="w-4 h-4" />
                    File Processing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Max File Size (MB)</Label>
                    <Select 
                      value={settings.processing.maxFileSize.toString()} 
                      onValueChange={(value) =>
                        updateNestedSettings('processing', { maxFileSize: parseInt(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="512">512 MB</SelectItem>
                        <SelectItem value="1024">1 GB</SelectItem>
                        <SelectItem value="2048">2 GB</SelectItem>
                        <SelectItem value="5120">5 GB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Generate Thumbnails</Label>
                      <p className="text-xs text-muted-foreground">
                        Create preview images for uploaded files
                      </p>
                    </div>
                    <Switch
                      checked={settings.processing.thumbnailGeneration}
                      onCheckedChange={(checked) =>
                        updateNestedSettings('processing', { thumbnailGeneration: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Auto Fit Bounds</Label>
                      <p className="text-xs text-muted-foreground">
                        Automatically zoom to show entire layer
                      </p>
                    </div>
                    <Switch
                      checked={settings.processing.autoFitBounds}
                      onCheckedChange={(checked) =>
                        updateNestedSettings('processing', { autoFitBounds: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>

        <Separator />

        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportSettings}>
              Export Settings
            </Button>
            <Button variant="outline" size="sm" onClick={resetSettings}>
              Reset to Defaults
            </Button>
          </div>
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};