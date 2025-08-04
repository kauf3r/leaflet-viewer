# Performance Optimization Guide

## Overview
This guide covers enterprise-level performance optimization strategies for handling large GeoTIFF files (50GB+) in the Leaflet Viewer application.

## Performance Architecture

### Client-Side Performance
```
Browser Memory Management (< 2GB)
├── Tile Cache (LRU) - 1GB max
├── UI Components - 100MB max
├── Application State - 50MB max
├── Network Buffers - 200MB max
└── WebWorker Memory - 650MB max
```

### Server-Side Performance
```
Processing Server (16-32GB RAM)
├── GDAL Processing - 8-16GB
├── Tile Generation - 4-8GB
├── File Buffer - 2-4GB
├── Database Cache - 1-2GB
└── System Overhead - 1-2GB
```

## Performance Targets & Benchmarks

### File Size Performance Matrix

| File Size | Upload Time | Processing Time | First View | Memory Usage |
|-----------|-------------|-----------------|------------|--------------|
| 100MB | 30s | 45s | 5s | 200MB browser |
| 1GB | 2min | 3min | 8s | 400MB browser |
| 10GB | 15min | 15min | 15s | 800MB browser |
| 50GB | 45min | 30min | 30s | 1.5GB browser |

### Geographic Performance Benchmarks

| Region Size | Zoom Levels | Tiles Generated | Load Time | Cache Size |
|-------------|-------------|-----------------|-----------|------------|
| City Block | 12-18 | 500 | 2s | 50MB |
| Neighborhood | 10-18 | 2,000 | 5s | 200MB |
| City | 8-18 | 8,000 | 15s | 800MB |
| County | 6-18 | 32,000 | 45s | 3.2GB |

## Optimization Strategies

### 1. Upload Optimization

#### Chunked Upload Strategy
```typescript
interface ChunkedUploadConfig {
  chunkSize: number;        // 100MB chunks
  concurrentChunks: number; // 4-8 parallel uploads
  retryAttempts: number;    // 3 retries per chunk
  checksumValidation: boolean; // Verify chunk integrity
}

class OptimizedUploader {
  private config: ChunkedUploadConfig = {
    chunkSize: 100 * 1024 * 1024, // 100MB
    concurrentChunks: 6,
    retryAttempts: 3,
    checksumValidation: true
  };

  async uploadLargeFile(file: File): Promise<void> {
    // Adaptive chunk size based on connection speed
    const connectionSpeed = await this.measureConnectionSpeed();
    this.config.chunkSize = this.adaptChunkSize(connectionSpeed);
    
    // Parallel upload with queue management
    const chunks = this.createChunks(file);
    await this.uploadChunksInParallel(chunks);
  }

  private adaptChunkSize(speed: number): number {
    if (speed > 50) return 200 * 1024 * 1024; // 200MB for fast connections
    if (speed > 10) return 100 * 1024 * 1024; // 100MB for medium connections
    return 50 * 1024 * 1024; // 50MB for slow connections
  }
}
```

#### Connection Quality Adaptation
```typescript
class ConnectionAdapter {
  private qualityMetrics = {
    bandwidth: 0,
    latency: 0,
    packetLoss: 0,
    stability: 0
  };

  async adaptUploadStrategy(): Promise<UploadStrategy> {
    const quality = await this.measureConnectionQuality();
    
    if (quality.bandwidth > 100 && quality.latency < 50) {
      return {
        chunkSize: 200 * 1024 * 1024,
        concurrentChunks: 8,
        compressionLevel: 1 // Minimal compression for fast connections
      };
    } else if (quality.bandwidth < 10 || quality.latency > 200) {
      return {
        chunkSize: 25 * 1024 * 1024,
        concurrentChunks: 2,
        compressionLevel: 6 // Higher compression for slow connections
      };
    }
    
    return this.getDefaultStrategy();
  }
}
```

### 2. Processing Optimization

#### Server-Side GDAL Optimization
```python
# Python GDAL optimization for large files
import gdal
from osgeo import gdal_array
import multiprocessing as mp

class OptimizedGDALProcessor:
    def __init__(self):
        # Configure GDAL for optimal performance
        gdal.SetConfigOption('GDAL_CACHEMAX', '8192')  # 8GB cache
        gdal.SetConfigOption('GDAL_NUM_THREADS', str(mp.cpu_count()))
        gdal.SetConfigOption('GDAL_SWATH_SIZE', '2048')  # 2GB swath
        gdal.SetConfigOption('VSI_CACHE', 'TRUE')
        gdal.SetConfigOption('VSI_CACHE_SIZE', '1000000000')  # 1GB

    def process_large_geotiff(self, input_path: str, output_path: str):
        # Use memory-mapped I/O for large files
        dataset = gdal.Open(input_path, gdal.GA_ReadOnly)
        
        # Create COG with optimal settings
        translate_options = gdal.TranslateOptions(
            format='COG',
            creationOptions=[
                'COMPRESS=LZW',
                'TILED=YES',
                'BLOCKSIZE=512',
                'INTERLEAVE=PIXEL',
                'NUM_THREADS=ALL_CPUS',
                'BIGTIFF=YES'
            ]
        )
        
        # Process with progress callback
        gdal.Translate(output_path, dataset, options=translate_options,
                      callback=self.progress_callback)
        
        # Generate overviews
        cog_dataset = gdal.Open(output_path, gdal.GA_Update)
        cog_dataset.BuildOverviews('AVERAGE', [2, 4, 8, 16, 32, 64, 128])
        
        return output_path
```

#### Memory-Efficient Tile Generation
```python
class OptimizedTileGenerator:
    def __init__(self, max_memory_gb=8):
        self.max_memory_bytes = max_memory_gb * 1024 * 1024 * 1024
        self.tile_cache = {}
        
    def generate_tiles_streaming(self, cog_path: str, output_dir: str):
        dataset = gdal.Open(cog_path)
        
        # Calculate optimal tile processing batch size
        memory_per_tile = self.estimate_tile_memory(dataset)
        batch_size = min(100, self.max_memory_bytes // memory_per_tile)
        
        # Generate tiles in batches to manage memory
        for zoom in range(18):
            tiles_for_zoom = self.calculate_tiles_for_zoom(dataset, zoom)
            
            for batch in self.batch_tiles(tiles_for_zoom, batch_size):
                self.process_tile_batch(dataset, batch, output_dir)
                
                # Force garbage collection after each batch
                import gc
                gc.collect()
```

### 3. Client-Side Optimization

#### Intelligent Tile Caching
```typescript
class IntelligentTileCache {
  private cache = new Map<string, TileData>();
  private usage = new Map<string, number>();
  private readonly MAX_CACHE_SIZE = 1024 * 1024 * 1024; // 1GB
  
  private currentSize = 0;
  private accessCounter = 0;

  async getTile(tileKey: string): Promise<TileData> {
    // Check cache first
    if (this.cache.has(tileKey)) {
      this.updateUsage(tileKey);
      return this.cache.get(tileKey)!;
    }

    // Load tile with memory check
    if (this.needsEviction()) {
      await this.evictLeastUsedTiles();
    }

    const tile = await this.loadTileFromServer(tileKey);
    this.addToCache(tileKey, tile);
    
    return tile;
  }

  private updateUsage(tileKey: string): void {
    this.usage.set(tileKey, ++this.accessCounter);
  }

  private needsEviction(): boolean {
    return this.currentSize > this.MAX_CACHE_SIZE * 0.8;
  }

  private async evictLeastUsedTiles(): Promise<void> {
    // Sort by usage frequency
    const sortedEntries = Array.from(this.usage.entries())
      .sort(([, a], [, b]) => a - b);

    // Remove oldest 25% of tiles
    const tilesToRemove = sortedEntries.slice(0, sortedEntries.length * 0.25);
    
    for (const [tileKey] of tilesToRemove) {
      this.removeFromCache(tileKey);
    }
  }
}
```

#### Viewport-Based Loading Priority
```typescript
class ViewportOptimizer {
  private loadingQueue = new PriorityQueue<TileRequest>();
  private currentViewport: ViewportBounds;

  onViewportChange(viewport: ViewportBounds): void {
    this.currentViewport = viewport;
    
    // Clear low-priority requests
    this.loadingQueue.clear(request => request.priority < 5);
    
    // Calculate new tile requirements
    const requiredTiles = this.calculateRequiredTiles(viewport);
    
    // Prioritize tiles by distance from center
    requiredTiles.forEach(tile => {
      const priority = this.calculateTilePriority(tile, viewport);
      this.loadingQueue.enqueue(new TileRequest(tile, priority));
    });
    
    this.processQueue();
  }

  private calculateTilePriority(tile: TileCoordinate, viewport: ViewportBounds): number {
    const distance = this.distanceFromViewportCenter(tile, viewport);
    const zoomRelevance = this.getZoomRelevance(tile.z, viewport.zoom);
    
    // Higher priority for center tiles and current zoom level
    return Math.max(0, 10 - distance) * zoomRelevance;
  }

  private async processQueue(): Promise<void> {
    while (!this.loadingQueue.isEmpty()) {
      const request = this.loadingQueue.dequeue();
      
      // Skip if tile is no longer in viewport
      if (!this.isInCurrentViewport(request.tile)) {
        continue;
      }
      
      await this.loadTile(request.tile);
    }
  }
}
```

### 4. Network Optimization

#### CDN Configuration
```nginx
# Nginx configuration for optimal tile serving
server {
    listen 443 ssl http2;
    server_name tiles.geotiff-viewer.com;

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        image/png
        image/jpeg
        image/webp
        application/json;

    # Cache configuration
    location /tiles/ {
        # Long cache for tiles (immutable content)
        expires 1y;
        add_header Cache-Control "public, immutable";
        
        # CORS headers
        add_header Access-Control-Allow-Origin "*";
        add_header Access-Control-Allow-Methods "GET, OPTIONS";
        
        # Preload adjacent tiles with HTTP/2 Push
        location ~* "^/tiles/(?<file_id>[^/]+)/(?<z>\d+)/(?<x>\d+)/(?<y>\d+)\.png$" {
            # Push adjacent tiles
            http2_push /tiles/$file_id/$z/$(($x+1))/$y.png;
            http2_push /tiles/$file_id/$z/$(($x-1))/$y.png;
            http2_push /tiles/$file_id/$z/$x/$(($y+1)).png;
            http2_push /tiles/$file_id/$z/$x/$(($y-1)).png;
            
            try_files $uri @storage;
        }
    }

    # Fallback to cloud storage
    location @storage {
        proxy_pass https://your-storage.amazonaws.com;
        proxy_cache tiles_cache;
        proxy_cache_valid 200 1y;
        proxy_cache_key "$scheme$proxy_host$uri$is_args$args";
    }
}
```

#### Connection Pooling & Keep-Alive
```typescript
class ConnectionManager {
  private pools = new Map<string, ConnectionPool>();
  
  createOptimizedPool(baseUrl: string): ConnectionPool {
    return {
      maxConnections: 12, // HTTP/2 allows more concurrent requests
      keepAlive: true,
      keepAliveMsecs: 30000,
      timeout: 60000,
      maxSockets: 50,
      maxFreeSockets: 10,
      scheduling: 'fifo'
    };
  }

  async optimizeForTileLoading(): Promise<void> {
    // Configure connection pooling for tile servers
    const tileServers = ['tiles1.example.com', 'tiles2.example.com'];
    
    tileServers.forEach(server => {
      this.pools.set(server, this.createOptimizedPool(`https://${server}`));
    });

    // Warm up connections
    await this.warmUpConnections();
  }
}
```

### 5. Memory Management

#### Browser Memory Monitoring
```typescript
class MemoryMonitor {
  private readonly WARNING_THRESHOLD = 1.5 * 1024 * 1024 * 1024; // 1.5GB
  private readonly CRITICAL_THRESHOLD = 1.8 * 1024 * 1024 * 1024; // 1.8GB
  
  startMonitoring(): void {
    setInterval(() => {
      if ('memory' in performance) {
        const memInfo = (performance as any).memory;
        const used = memInfo.usedJSHeapSize;
        
        if (used > this.CRITICAL_THRESHOLD) {
          this.handleCriticalMemory();
        } else if (used > this.WARNING_THRESHOLD) {
          this.handleWarningMemory();
        }
      }
    }, 5000);
  }

  private handleCriticalMemory(): void {
    // Aggressive cleanup
    this.clearAllCaches();
    this.reduceQuality();
    this.limitConcurrentOperations(2);
    
    // Notify user
    this.notifyUser('Memory usage high. Reducing quality for better performance.');
  }

  private handleWarningMemory(): void {
    // Gentle cleanup
    this.evictOldCache();
    this.pausePreloading();
  }
}
```

#### Garbage Collection Optimization
```typescript
class GCOptimizer {
  private gcScheduler: NodeJS.Timeout | null = null;
  
  scheduleOptimalGC(): void {
    // Schedule GC during idle periods
    this.gcScheduler = setInterval(() => {
      if (this.isSystemIdle()) {
        this.requestGarbageCollection();
      }
    }, 30000);
  }

  private requestGarbageCollection(): void {
    // Manual GC trigger (development only)
    if (typeof window !== 'undefined' && 'gc' in window) {
      (window as any).gc();
    }
    
    // Alternative: trigger GC through memory pressure
    this.createTemporaryMemoryPressure();
  }

  private createTemporaryMemoryPressure(): void {
    // Create and immediately release large array to trigger GC
    const pressure = new Array(10000000);
    pressure.fill(0);
    pressure.length = 0;
  }
}
```

## Performance Monitoring

### Key Performance Indicators (KPIs)

```typescript
interface PerformanceKPIs {
  // Upload Performance
  uploadThroughput: number;    // MB/s
  uploadSuccessRate: number;   // %
  chunkFailureRate: number;    // %
  
  // Processing Performance
  processingTime: number;      // seconds
  tileGenerationRate: number;  // tiles/minute
  memoryEfficiency: number;    // %
  
  // Client Performance
  tileLoadTime: number;        // ms average
  cacheHitRate: number;        // %
  frameRate: number;           // fps
  memoryUsage: number;         // MB
  
  // User Experience
  timeToFirstView: number;     // seconds
  interactionDelay: number;    // ms
  errorRate: number;           // %
}
```

### Performance Dashboard
```typescript
class PerformanceDashboard {
  private metrics: PerformanceKPIs;
  
  generateReport(): PerformanceReport {
    return {
      summary: this.calculateSummaryMetrics(),
      trends: this.calculateTrends(),
      recommendations: this.generateRecommendations(),
      alerts: this.checkPerformanceAlerts()
    };
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (this.metrics.cacheHitRate < 0.7) {
      recommendations.push('Increase tile cache size to improve performance');
    }
    
    if (this.metrics.tileLoadTime > 500) {
      recommendations.push('Consider using WebP format for better compression');
    }
    
    if (this.metrics.memoryUsage > 1500) {
      recommendations.push('Enable aggressive tile eviction to reduce memory usage');
    }
    
    return recommendations;
  }
}
```

## Performance Testing

### Load Testing Configuration
```yaml
# Artillery.js load test configuration
config:
  target: 'https://api.geotiff-viewer.com'
  phases:
    - duration: 300  # 5 minutes
      arrivalRate: 10
      name: "Warm up"
    - duration: 600  # 10 minutes
      arrivalRate: 50
      name: "Load test"
    - duration: 300  # 5 minutes
      arrivalRate: 100
      name: "Stress test"

scenarios:
  - name: "Large file upload"
    weight: 30
    engine: http
    flow:
      - post:
          url: "/v1/files/upload/initialize"
          json:
            filename: "test-50gb.tif"
            size: 53687091200
      - think: 2
      - loop:
        - put:
            url: "/v1/files/upload/{{ upload_id }}/chunks/{{ $loopCount }}"
            body: "{{ $randomBytes(104857600) }}"
        count: 100

  - name: "Tile serving"
    weight: 70
    engine: http
    flow:
      - get:
          url: "/v1/files/{{ file_id }}/tiles/{{ $randomInt(8, 15) }}/{{ $randomInt(0, 1000) }}/{{ $randomInt(0, 1000) }}.png"
```

### Benchmark Scripts
```bash
#!/bin/bash
# performance-benchmark.sh

echo "Running GeoTIFF Viewer Performance Benchmarks"

# File upload performance
echo "Testing upload performance..."
time curl -X POST https://api.geotiff-viewer.com/v1/files/upload/initialize \
  -H "Content-Type: application/json" \
  -d '{"filename": "test.tif", "size": 1073741824}'

# Tile serving performance  
echo "Testing tile serving performance..."
ab -n 1000 -c 10 https://tiles.geotiff-viewer.com/files/test/12/1234/5678.png

# Memory usage test
echo "Testing memory efficiency..."
node --expose-gc memory-test.js

# WebGL performance test
echo "Testing WebGL rendering..."
node webgl-benchmark.js

echo "Benchmark complete. Check results in benchmark-results.json"
```

## Optimization Checklist

### Server-Side Optimization
- [ ] GDAL configured with optimal cache settings (8GB+)
- [ ] Multi-threaded processing enabled
- [ ] COG conversion with appropriate compression
- [ ] Tile pyramid generation with multiple levels
- [ ] Database query optimization with proper indexes
- [ ] Redis caching for frequently accessed data

### Client-Side Optimization  
- [ ] LRU tile caching with memory pressure monitoring
- [ ] Viewport-based loading prioritization
- [ ] Web Workers for background processing
- [ ] ServiceWorker for offline tile caching
- [ ] Connection pooling and HTTP/2 usage
- [ ] Progressive image loading (low → high quality)

### Infrastructure Optimization
- [ ] CDN configured with appropriate cache headers
- [ ] Load balancing across multiple regions
- [ ] Auto-scaling based on processing queue length
- [ ] Database connection pooling
- [ ] Monitoring and alerting for performance metrics

---

**Expected Performance for 49.67 GB File**:
- Upload: 30-45 minutes (with resume capability)
- Processing: 20-35 minutes (server-dependent)  
- First view: 30-60 seconds
- Smooth navigation: <200ms tile loads
- Memory usage: <2GB browser, 16-32GB server peak