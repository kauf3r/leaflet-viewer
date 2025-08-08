/**
 * GeoTIFF Streaming and Progressive Loading
 * Handles large files (up to 1GB) with efficient memory management
 */

interface TileRequest {
  x: number;
  y: number;
  z: number;
  bounds: [number, number, number, number];
}

interface StreamingOptions {
  tileSize: number;
  maxZoom: number;
  cacheSize: number; // MB
  priorityLevels: number[];
}

export class GeoTIFFStreamer {
  private cache = new Map<string, ArrayBuffer>();
  private cacheSize = 0;
  private readonly maxCacheSize: number;
  private readonly options: StreamingOptions;
  private abortController = new AbortController();

  constructor(options: Partial<StreamingOptions> = {}) {
    this.options = {
      tileSize: 256,
      maxZoom: 18,
      cacheSize: 100, // 100MB default cache
      priorityLevels: [8, 12, 16], // Zoom levels for progressive loading
      ...options,
    };
    this.maxCacheSize = this.options.cacheSize * 1024 * 1024; // Convert to bytes
  }

  /**
   * Stream GeoTIFF data progressively based on viewport
   */
  async streamTiles(
    url: string,
    viewport: { bounds: [number, number, number, number]; zoom: number },
    onTileLoad: (tile: ArrayBuffer, key: string) => void,
    onProgress: (loaded: number, total: number) => void
  ): Promise<void> {
    const tiles = this.calculateRequiredTiles(viewport);
    const prioritizedTiles = this.prioritizeTiles(tiles, viewport.zoom);

    let loaded = 0;
    const total = prioritizedTiles.length;

    // Process tiles in priority order
    for (const tile of prioritizedTiles) {
      if (this.abortController.signal.aborted) break;

      const tileKey = this.getTileKey(tile);
      
      // Check cache first
      if (this.cache.has(tileKey)) {
        onTileLoad(this.cache.get(tileKey)!, tileKey);
        loaded++;
        onProgress(loaded, total);
        continue;
      }

      try {
        const tileData = await this.fetchTile(url, tile);
        
        // Cache management
        await this.addToCache(tileKey, tileData);
        
        onTileLoad(tileData, tileKey);
        loaded++;
        onProgress(loaded, total);

        // Yield to prevent blocking
        if (loaded % 5 === 0) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      } catch (error) {
        console.warn(`Failed to load tile ${tileKey}:`, error);
        loaded++;
        onProgress(loaded, total);
      }
    }
  }

  /**
   * Calculate required tiles for viewport
   */
  private calculateRequiredTiles(viewport: {
    bounds: [number, number, number, number];
    zoom: number;
  }): TileRequest[] {
    const { bounds, zoom } = viewport;
    const { tileSize } = this.options;
    const tiles: TileRequest[] = [];

    // Calculate tile grid bounds
    const minTileX = Math.floor((bounds[0] + 180) / 360 * Math.pow(2, zoom));
    const maxTileX = Math.floor((bounds[2] + 180) / 360 * Math.pow(2, zoom));
    const minTileY = Math.floor((1 - Math.log(Math.tan(bounds[3] * Math.PI / 180) + 1 / Math.cos(bounds[3] * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
    const maxTileY = Math.floor((1 - Math.log(Math.tan(bounds[1] * Math.PI / 180) + 1 / Math.cos(bounds[1] * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));

    for (let x = minTileX; x <= maxTileX; x++) {
      for (let y = minTileY; y <= maxTileY; y++) {
        tiles.push({
          x,
          y,
          z: zoom,
          bounds: this.tileToBounds(x, y, zoom),
        });
      }
    }

    return tiles;
  }

  /**
   * Prioritize tiles based on distance from center and zoom level
   */
  private prioritizeTiles(tiles: TileRequest[], currentZoom: number): TileRequest[] {
    if (tiles.length === 0) return tiles;
    
    const centerTile = tiles[Math.floor(tiles.length / 2)];
    if (!centerTile) return tiles;
    
    return tiles.sort((a, b) => {
      // Prioritize current zoom level
      if (a.z === currentZoom && b.z !== currentZoom) return -1;
      if (b.z === currentZoom && a.z !== currentZoom) return 1;

      // Then by distance from center
      const distA = Math.abs(a.x - centerTile.x) + Math.abs(a.y - centerTile.y);
      const distB = Math.abs(b.x - centerTile.x) + Math.abs(b.y - centerTile.y);
      return distA - distB;
    });
  }

  /**
   * Fetch individual tile with range requests for COG files
   */
  private async fetchTile(url: string, tile: TileRequest): Promise<ArrayBuffer> {
    const tileUrl = this.buildTileUrl(url, tile);
    
    const response = await fetch(tileUrl, {
      signal: this.abortController.signal,
      headers: {
        'Range': `bytes=${this.calculateTileRange(tile)}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.arrayBuffer();
  }

  /**
   * Efficient cache management with LRU eviction
   */
  private async addToCache(key: string, data: ArrayBuffer): Promise<void> {
    const dataSize = data.byteLength;
    
    // Evict old entries if cache would exceed limit
    while (this.cacheSize + dataSize > this.maxCacheSize && this.cache.size > 0) {
      const firstKey = this.cache.keys().next().value as string;
      const firstData = this.cache.get(firstKey);
      if (firstData) {
        this.cacheSize -= firstData.byteLength;
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, data);
    this.cacheSize += dataSize;
  }

  /**
   * Generate tile key for caching
   */
  private getTileKey(tile: TileRequest): string {
    return `${tile.z}/${tile.x}/${tile.y}`;
  }

  /**
   * Convert tile coordinates to geographic bounds
   */
  private tileToBounds(x: number, y: number, z: number): [number, number, number, number] {
    const n = Math.pow(2, z);
    const lon_deg = x / n * 360.0 - 180.0;
    const lat_rad = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n)));
    const lat_deg = lat_rad * 180.0 / Math.PI;
    
    const lon_deg2 = (x + 1) / n * 360.0 - 180.0;
    const lat_rad2 = Math.atan(Math.sinh(Math.PI * (1 - 2 * (y + 1) / n)));
    const lat_deg2 = lat_rad2 * 180.0 / Math.PI;

    return [lon_deg, lat_deg2, lon_deg2, lat_deg];
  }

  /**
   * Build tile URL for COG access
   */
  private buildTileUrl(baseUrl: string, tile: TileRequest): string {
    return `${baseUrl}?tile=${tile.z}/${tile.x}/${tile.y}`;
  }

  /**
   * Calculate byte range for tile (COG-specific)
   */
  private calculateTileRange(tile: TileRequest): string {
    // This would be implemented based on COG structure
    // For now, return a placeholder
    const start = (tile.z * 1000000) + (tile.x * 1000) + tile.y;
    const end = start + 65536; // 64KB tiles
    return `${start}-${end}`;
  }

  /**
   * Cancel all ongoing requests
   */
  public cancel(): void {
    this.abortController.abort();
    this.abortController = new AbortController();
  }

  /**
   * Clear cache and free memory
   */
  public clearCache(): void {
    this.cache.clear();
    this.cacheSize = 0;
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): { size: number; entries: number; hitRate: number } {
    return {
      size: Math.round(this.cacheSize / 1024 / 1024 * 100) / 100, // MB
      entries: this.cache.size,
      hitRate: 0, // Would track hit rate in production
    };
  }
}