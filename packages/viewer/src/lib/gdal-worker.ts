/**
 * GDAL Web Worker for GeoTIFF processing
 * Handles heavy computational tasks without blocking the main thread
 */

// Worker message types
interface WorkerMessage {
  id: string;
  type: 'process' | 'analyze' | 'transform' | 'thumbnail';
  data: any;
}

interface WorkerResponse {
  id: string;
  type: 'success' | 'error' | 'progress';
  data: any;
  error?: string;
}

class GDALWorkerManager {
  private worker: Worker | null = null;
  private pendingTasks = new Map<string, {
    resolve: (value: any) => void;
    reject: (error: Error) => void;
    onProgress?: (progress: number) => void;
  }>();
  private isInitialized = false;

  constructor() {
    this.initializeWorker();
  }

  /**
   * Initialize the GDAL Web Worker
   */
  private async initializeWorker(): Promise<void> {
    if (typeof Worker === 'undefined') {
      throw new Error('Web Workers not supported');
    }

    // Create worker with inline code to avoid separate file
    const workerCode = this.getWorkerCode();
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);

    this.worker = new Worker(workerUrl);
    this.worker.onmessage = this.handleWorkerMessage.bind(this);
    this.worker.onerror = this.handleWorkerError.bind(this);

    // Initialize GDAL in worker
    await this.sendMessage('init', {});
    this.isInitialized = true;

    // Clean up blob URL
    URL.revokeObjectURL(workerUrl);
  }

  /**
   * Process GeoTIFF file for display
   */
  async processGeoTIFF(
    buffer: ArrayBuffer,
    options: {
      outputFormat: 'png' | 'webp' | 'tiles';
      zoom?: number;
      bounds?: [number, number, number, number];
      colormap?: string;
    },
    onProgress?: (progress: number) => void
  ): Promise<ArrayBuffer> {
    if (!this.isInitialized) {
      await this.initializeWorker();
    }

    return this.sendMessage('process', {
      buffer,
      options,
    }, onProgress);
  }

  /**
   * Analyze GeoTIFF metadata and statistics
   */
  async analyzeGeoTIFF(buffer: ArrayBuffer): Promise<{
    width: number;
    height: number;
    bands: number;
    projection: string;
    bounds: [number, number, number, number];
    statistics: Array<{
      min: number;
      max: number;
      mean: number;
      stddev: number;
    }>;
  }> {
    if (!this.isInitialized) {
      await this.initializeWorker();
    }

    return this.sendMessage('analyze', { buffer });
  }

  /**
   * Generate thumbnail for layer preview
   */
  async generateThumbnail(
    buffer: ArrayBuffer,
    maxSize: number = 256
  ): Promise<ArrayBuffer> {
    if (!this.isInitialized) {
      await this.initializeWorker();
    }

    return this.sendMessage('thumbnail', {
      buffer,
      maxSize,
    });
  }

  /**
   * Transform GeoTIFF projection
   */
  async transformProjection(
    buffer: ArrayBuffer,
    targetProjection: string,
    onProgress?: (progress: number) => void
  ): Promise<ArrayBuffer> {
    if (!this.isInitialized) {
      await this.initializeWorker();
    }

    return this.sendMessage('transform', {
      buffer,
      targetProjection,
    }, onProgress);
  }

  /**
   * Send message to worker and return promise
   */
  private sendMessage(
    type: string,
    data: any,
    onProgress?: (progress: number) => void
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      this.pendingTasks.set(id, {
        resolve,
        reject,
        onProgress,
      });

      this.worker?.postMessage({
        id,
        type,
        data,
      });
    });
  }

  /**
   * Handle messages from worker
   */
  private handleWorkerMessage(event: MessageEvent<WorkerResponse>): void {
    const { id, type, data, error } = event.data;
    const task = this.pendingTasks.get(id);
    
    if (!task) return;

    switch (type) {
      case 'success':
        task.resolve(data);
        this.pendingTasks.delete(id);
        break;
      
      case 'error':
        task.reject(new Error(error || 'Worker error'));
        this.pendingTasks.delete(id);
        break;
      
      case 'progress':
        task.onProgress?.(data.progress);
        break;
    }
  }

  /**
   * Handle worker errors
   */
  private handleWorkerError(error: ErrorEvent): void {
    console.error('GDAL Worker error:', error);
    
    // Reject all pending tasks
    for (const [id, task] of this.pendingTasks) {
      task.reject(new Error('Worker crashed'));
    }
    this.pendingTasks.clear();
    
    // Try to reinitialize
    this.isInitialized = false;
    this.initializeWorker().catch(console.error);
  }

  /**
   * Get the worker code as string
   */
  private getWorkerCode(): string {
    return `
      // GDAL Web Worker Implementation
      let gdalModule = null;
      let isInitialized = false;

      // Import GDAL WebAssembly (would be actual GDAL-JS in production)
      async function initializeGDAL() {
        try {
          // In production, this would import the actual GDAL WebAssembly module
          // For demonstration, we'll simulate the initialization
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          gdalModule = {
            // Simulated GDAL functions
            openDataset: (buffer) => ({ buffer, width: 1024, height: 1024 }),
            getMetadata: (dataset) => ({
              width: 1024,
              height: 1024,
              bands: 3,
              projection: 'EPSG:4326',
              bounds: [-180, -90, 180, 90],
            }),
            processToImage: async (dataset, options) => {
              // Simulate processing time
              await new Promise(resolve => setTimeout(resolve, 2000));
              return new ArrayBuffer(1024 * 1024); // Simulated image data
            },
            calculateStatistics: (dataset) => ([
              { min: 0, max: 255, mean: 127.5, stddev: 73.5 },
              { min: 0, max: 255, mean: 127.5, stddev: 73.5 },
              { min: 0, max: 255, mean: 127.5, stddev: 73.5 },
            ]),
            generateThumbnail: async (dataset, maxSize) => {
              await new Promise(resolve => setTimeout(resolve, 500));
              return new ArrayBuffer(maxSize * maxSize * 4); // RGBA thumbnail
            },
            reproject: async (dataset, targetProjection) => {
              await new Promise(resolve => setTimeout(resolve, 3000));
              return new ArrayBuffer(dataset.buffer.byteLength);
            },
          };
          
          isInitialized = true;
        } catch (error) {
          throw new Error('Failed to initialize GDAL: ' + error.message);
        }
      }

      // Message handler
      self.onmessage = async function(event) {
        const { id, type, data } = event.data;

        try {
          let result;

          switch (type) {
            case 'init':
              await initializeGDAL();
              result = { initialized: true };
              break;

            case 'process':
              if (!isInitialized) throw new Error('GDAL not initialized');
              
              const dataset = gdalModule.openDataset(data.buffer);
              
              // Send progress updates
              self.postMessage({ id, type: 'progress', data: { progress: 25 } });
              await new Promise(resolve => setTimeout(resolve, 500));
              
              self.postMessage({ id, type: 'progress', data: { progress: 50 } });
              await new Promise(resolve => setTimeout(resolve, 500));
              
              self.postMessage({ id, type: 'progress', data: { progress: 75 } });
              result = await gdalModule.processToImage(dataset, data.options);
              break;

            case 'analyze':
              if (!isInitialized) throw new Error('GDAL not initialized');
              
              const analyzeDataset = gdalModule.openDataset(data.buffer);
              const metadata = gdalModule.getMetadata(analyzeDataset);
              const statistics = gdalModule.calculateStatistics(analyzeDataset);
              
              result = {
                ...metadata,
                statistics,
              };
              break;

            case 'thumbnail':
              if (!isInitialized) throw new Error('GDAL not initialized');
              
              const thumbDataset = gdalModule.openDataset(data.buffer);
              result = await gdalModule.generateThumbnail(thumbDataset, data.maxSize);
              break;

            case 'transform':
              if (!isInitialized) throw new Error('GDAL not initialized');
              
              const transformDataset = gdalModule.openDataset(data.buffer);
              
              // Send progress updates for long operation
              for (let i = 0; i <= 100; i += 20) {
                self.postMessage({ id, type: 'progress', data: { progress: i } });
                await new Promise(resolve => setTimeout(resolve, 100));
              }
              
              result = await gdalModule.reproject(transformDataset, data.targetProjection);
              break;

            default:
              throw new Error('Unknown message type: ' + type);
          }

          self.postMessage({
            id,
            type: 'success',
            data: result,
          });

        } catch (error) {
          self.postMessage({
            id,
            type: 'error',
            error: error.message,
          });
        }
      };
    `;
  }

  /**
   * Terminate worker and clean up
   */
  dispose(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    
    // Reject all pending tasks
    for (const [id, task] of this.pendingTasks) {
      task.reject(new Error('Worker disposed'));
    }
    this.pendingTasks.clear();
    
    this.isInitialized = false;
  }
}

// Export singleton instance
export const gdalWorker = new GDALWorkerManager();

// Export types for use in components
export type { WorkerMessage, WorkerResponse };