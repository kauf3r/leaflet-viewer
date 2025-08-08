/**
 * Layer Memory Manager
 * Efficiently manages memory for concurrent viewing of 2-4 GeoTIFF layers
 */

interface LayerMemoryInfo {
  id: string;
  size: number; // bytes
  lastAccessed: number;
  priority: 'high' | 'medium' | 'low';
  isVisible: boolean;
  renderData?: ArrayBuffer;
  thumbnailData?: ArrayBuffer;
}

interface MemoryLimits {
  maxTotalMemory: number; // bytes
  maxLayersInMemory: number;
  thumbnailCacheSize: number;
  renderCacheSize: number;
}

export class LayerMemoryManager {
  private layers = new Map<string, LayerMemoryInfo>();
  private currentMemoryUsage = 0;
  private readonly limits: MemoryLimits;
  private memoryPressureCallbacks = new Set<() => void>();

  constructor(limits: Partial<MemoryLimits> = {}) {
    this.limits = {
      maxTotalMemory: 512 * 1024 * 1024, // 512MB default
      maxLayersInMemory: 4,
      thumbnailCacheSize: 50 * 1024 * 1024, // 50MB for thumbnails
      renderCacheSize: 400 * 1024 * 1024, // 400MB for render data
      ...limits,
    };

    this.setupMemoryMonitoring();
  }

  /**
   * Add or update layer memory tracking
   */
  async addLayer(
    id: string,
    renderData: ArrayBuffer,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<boolean> {
    const size = renderData.byteLength;
    
    // Check if we can accommodate this layer
    if (!await this.canAccommodateLayer(size)) {
      await this.freeMemoryForLayer(size);
    }

    // If still can't accommodate, reject
    if (this.currentMemoryUsage + size > this.limits.maxTotalMemory) {
      console.warn(`Cannot add layer ${id}: insufficient memory`);
      return false;
    }

    // Remove existing layer if updating
    if (this.layers.has(id)) {
      await this.removeLayer(id);
    }

    // Add new layer
    const layerInfo: LayerMemoryInfo = {
      id,
      size,
      lastAccessed: Date.now(),
      priority,
      isVisible: true,
      renderData: renderData.slice(0), // Create copy
    };

    this.layers.set(id, layerInfo);
    this.currentMemoryUsage += size;

    // Generate thumbnail asynchronously
    this.generateThumbnail(id, renderData);

    return true;
  }

  /**
   * Remove layer and free memory
   */
  async removeLayer(id: string): Promise<void> {
    const layer = this.layers.get(id);
    if (!layer) return;

    this.currentMemoryUsage -= layer.size;
    
    // Clear references to help garbage collection
    if (layer.renderData) {
      layer.renderData = undefined;
    }
    if (layer.thumbnailData) {
      layer.thumbnailData = undefined;
    }

    this.layers.delete(id);
    
    // Force garbage collection hint
    if ('gc' in globalThis && typeof globalThis.gc === 'function') {
      globalThis.gc();
    }
  }

  /**
   * Update layer visibility and priority
   */
  updateLayerVisibility(id: string, isVisible: boolean): void {
    const layer = this.layers.get(id);
    if (!layer) return;

    layer.isVisible = isVisible;
    layer.lastAccessed = Date.now();

    // Move to lower priority if hidden
    if (!isVisible && layer.priority !== 'high') {
      layer.priority = 'low';
    }
  }

  /**
   * Get layer data with access tracking
   */
  getLayerData(id: string): ArrayBuffer | null {
    const layer = this.layers.get(id);
    if (!layer || !layer.renderData) return null;

    layer.lastAccessed = Date.now();
    return layer.renderData;
  }

  /**
   * Get layer thumbnail (smaller version for overview)
   */
  getLayerThumbnail(id: string): ArrayBuffer | null {
    const layer = this.layers.get(id);
    if (!layer) return null;

    layer.lastAccessed = Date.now();
    return layer.thumbnailData || null;
  }

  /**
   * Check if we can accommodate a new layer
   */
  private async canAccommodateLayer(size: number): Promise<boolean> {
    // Check memory limit
    if (this.currentMemoryUsage + size > this.limits.maxTotalMemory) {
      return false;
    }

    // Check layer count limit
    if (this.layers.size >= this.limits.maxLayersInMemory) {
      return false;
    }

    return true;
  }

  /**
   * Free memory by removing least important layers
   */
  private async freeMemoryForLayer(requiredSize: number): Promise<void> {
    const layersArray = Array.from(this.layers.values());
    
    // Sort by priority and access time (LRU for same priority)
    layersArray.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      
      // First by visibility (hidden layers first)
      if (a.isVisible !== b.isVisible) {
        return a.isVisible ? 1 : -1;
      }
      
      // Then by priority
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Finally by last accessed (oldest first)
      return a.lastAccessed - b.lastAccessed;
    });

    // Remove layers until we have enough space
    let freedMemory = 0;
    for (const layer of layersArray) {
      if (freedMemory >= requiredSize) break;
      
      // Don't remove high priority visible layers
      if (layer.priority === 'high' && layer.isVisible) continue;
      
      freedMemory += layer.size;
      await this.removeLayer(layer.id);
    }
  }

  /**
   * Generate thumbnail for quick preview
   */
  private async generateThumbnail(id: string, renderData: ArrayBuffer): Promise<void> {
    try {
      // This would typically use a Web Worker to process the thumbnail
      // For now, simulate the process
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const layer = this.layers.get(id);
      if (!layer) return;

      // Simulate thumbnail generation (would be actual image processing)
      const thumbnailSize = Math.min(renderData.byteLength / 10, 1024 * 1024); // Max 1MB thumbnail
      const thumbnail = new ArrayBuffer(thumbnailSize);
      
      layer.thumbnailData = thumbnail;
      
    } catch (error) {
      console.warn(`Failed to generate thumbnail for layer ${id}:`, error);
    }
  }

  /**
   * Setup memory pressure monitoring
   */
  private setupMemoryMonitoring(): void {
    // Monitor memory usage periodically
    setInterval(() => {
      this.checkMemoryPressure();
    }, 5000); // Check every 5 seconds

    // Listen for memory pressure events (if supported)
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      if (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit > 0.8) {
        this.handleMemoryPressure();
      }
    }
  }

  /**
   * Check for memory pressure and take action
   */
  private checkMemoryPressure(): void {
    const memoryUsageRatio = this.currentMemoryUsage / this.limits.maxTotalMemory;
    
    if (memoryUsageRatio > 0.9) {
      console.warn('High memory usage detected, freeing up space...');
      this.handleMemoryPressure();
    }
  }

  /**
   * Handle memory pressure by freeing up space
   */
  private handleMemoryPressure(): void {
    // Notify callbacks
    this.memoryPressureCallbacks.forEach(callback => callback());
    
    // Remove thumbnails from non-visible layers
    for (const [id, layer] of this.layers) {
      if (!layer.isVisible && layer.thumbnailData) {
        layer.thumbnailData = undefined;
      }
    }
    
    // If still under pressure, remove lowest priority layers
    if (this.currentMemoryUsage > this.limits.maxTotalMemory * 0.8) {
      this.freeMemoryForLayer(this.limits.maxTotalMemory * 0.2);
    }
  }

  /**
   * Register callback for memory pressure events
   */
  onMemoryPressure(callback: () => void): () => void {
    this.memoryPressureCallbacks.add(callback);
    return () => this.memoryPressureCallbacks.delete(callback);
  }

  /**
   * Get current memory statistics
   */
  getMemoryStats(): {
    currentUsage: number;
    maxUsage: number;
    layerCount: number;
    usagePercentage: number;
  } {
    return {
      currentUsage: Math.round(this.currentMemoryUsage / 1024 / 1024 * 100) / 100, // MB
      maxUsage: Math.round(this.limits.maxTotalMemory / 1024 / 1024 * 100) / 100, // MB
      layerCount: this.layers.size,
      usagePercentage: Math.round((this.currentMemoryUsage / this.limits.maxTotalMemory) * 100),
    };
  }

  /**
   * Preload layer data for smooth switching
   */
  async preloadLayer(id: string, dataUrl: string): Promise<void> {
    if (this.layers.has(id)) return; // Already loaded

    try {
      const response = await fetch(dataUrl);
      const arrayBuffer = await response.arrayBuffer();
      
      // Add with low priority for preloading
      await this.addLayer(id, arrayBuffer, 'low');
      
      // Mark as not visible initially
      this.updateLayerVisibility(id, false);
      
    } catch (error) {
      console.warn(`Failed to preload layer ${id}:`, error);
    }
  }

  /**
   * Clean up all resources
   */
  dispose(): void {
    for (const [id] of this.layers) {
      this.removeLayer(id);
    }
    this.memoryPressureCallbacks.clear();
  }
}