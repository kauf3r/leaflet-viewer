"use client";

import React, { useState, useEffect } from 'react';
import { Copy, Check, Share2, Link, Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAppStore } from '@/lib/store';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { layers, activeLayerId } = useAppStore();
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [supportsWebShare, setSupportsWebShare] = useState(false);

  useEffect(() => {
    if (open) {
      generateShareUrl();
      // Check for Web Share API support
      setSupportsWebShare(typeof navigator !== 'undefined' && !!navigator.share);
    }
  }, [open, layers, activeLayerId]);

  const generateShareUrl = () => {
    // Create URL with current state - only in browser
    if (typeof window === 'undefined') return;
    
    const currentUrl = new URL(window.location.href);
    
    // Clear existing params
    currentUrl.search = '';
    
    // Add layer information
    if (layers.length > 0) {
      const layerData = layers.map(layer => ({
        id: layer.id,
        name: layer.name,
        visible: layer.visible,
        opacity: layer.opacity,
        bounds: layer.bounds,
      }));
      
      // Encode layer data - in a real app, you'd likely store this server-side and just pass an ID
      const encoded = btoa(JSON.stringify({
        layers: layerData,
        activeLayerId,
        timestamp: Date.now(),
      }));
      
      currentUrl.searchParams.set('state', encoded);
    }
    
    setShareUrl(currentUrl.toString());
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy link');
    }
  };

  const shareViaWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'GeoTIFF Viewer',
          text: 'Check out this GeoTIFF visualization',
          url: shareUrl,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Share failed:', error);
          toast.error('Sharing failed');
        }
      }
    } else {
      // Fallback to copy
      copyToClipboard();
    }
  };

  const downloadState = () => {
    const stateData = {
      layers: layers.map(layer => ({
        id: layer.id,
        name: layer.name,
        visible: layer.visible,
        opacity: layer.opacity,
        bounds: layer.bounds,
        metadata: layer.metadata,
      })),
      activeLayerId,
      timestamp: Date.now(),
      version: '1.0',
    };

    const blob = new Blob([JSON.stringify(stateData, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `geotiff-viewer-state-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('State file downloaded!');
  };

  const hasLayers = layers.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share View
          </DialogTitle>
          <DialogDescription>
            {hasLayers 
              ? 'Share your current map view and layer configuration with others'
              : 'Add some layers to create a shareable view'
            }
          </DialogDescription>
        </DialogHeader>

        {hasLayers ? (
          <div className="space-y-4">
            {/* Share URL */}
            <div className="space-y-2">
              <Label htmlFor="share-url" className="flex items-center gap-2">
                <Link className="w-4 h-4" />
                Shareable Link
              </Label>
              <div className="flex gap-2">
                <Input
                  id="share-url"
                  value={shareUrl}
                  readOnly
                  className="text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="flex items-center gap-1 px-3"
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Anyone with this link can view your current map configuration
              </p>
            </div>

            <Separator />

            {/* Share Actions */}
            <div className="space-y-2">
              <Label>Share Options</Label>
              <div className="flex gap-2">
                {supportsWebShare && (
                  <Button
                    variant="outline"
                    onClick={shareViaWebShare}
                    className="flex items-center gap-2 flex-1"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={downloadState}
                  className="flex items-center gap-2 flex-1"
                >
                  <Download className="w-4 h-4" />
                  Download State
                </Button>
              </div>
            </div>

            {/* Current State Info */}
            <div className="rounded-lg bg-muted p-3 space-y-1">
              <p className="text-sm font-medium">Current View</p>
              <p className="text-xs text-muted-foreground">
                {layers.length} layer{layers.length !== 1 ? 's' : ''} • {layers.filter(l => l.visible).length} visible
              </p>
              {activeLayerId && (
                <p className="text-xs text-muted-foreground">
                  Active: {layers.find(l => l.id === activeLayerId)?.name}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Share2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Upload GeoTIFF files to create a shareable view
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};