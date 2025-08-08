/**
 * Progressive Loading System for GeoTIFF Showcase Tool
 * Implements multi-level caching and progressive enhancement
 */

interface ProgressiveLoadOptions {
  enableServiceWorker: boolean;
  cacheTTL: number; // milliseconds
  maxCacheSize: number; // bytes
  progressiveLevels: number[];
}

interface CacheEntry {
  data: ArrayBuffer;
  timestamp: number;
  level: number;
  size: number;
  accessCount: number;
}

export class ProgressiveLoader {
  private memoryCache = new Map<string, CacheEntry>();
  private indexedDBCache: IDBDatabase | null = null;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private currentCacheSize = 0;
  private readonly options: ProgressiveLoadOptions;

  constructor(options: Partial<ProgressiveLoadOptions> = {}) {
    this.options = {
      enableServiceWorker: true,
      cacheTTL: 24 * 60 * 60 * 1000, // 24 hours
      maxCacheSize: 200 * 1024 * 1024, // 200MB
      progressiveLevels: [1, 2, 4, 8], // Quality levels
      ...options,
    };

    this.initialize();
  }

  /**
   * Initialize all caching layers
   */
  private async initialize(): Promise<void> {
    await Promise.all([
      this.initializeIndexedDB(),
      this.initializeServiceWorker(),
    ]);
  }

  /**
   * Load GeoTIFF with progressive enhancement
   */
  async loadProgressive(
    url: string,
    onProgress: (level: number, data: ArrayBuffer) => void,
    onComplete: (data: ArrayBuffer) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(url);
      
      // Check memory cache first
      const memoryEntry = this.memoryCache.get(cacheKey);
      if (memoryEntry && this.isValidCacheEntry(memoryEntry)) {
        onComplete(memoryEntry.data);
        return;
      }

      // Check IndexedDB cache
      const idbEntry = await this.getFromIndexedDB(cacheKey);
      if (idbEntry && this.isValidCacheEntry(idbEntry)) {
        this.addToMemoryCache(cacheKey, idbEntry);
        onComplete(idbEntry.data);
        return;
      }

      // Load progressively from network
      await this.loadProgressiveFromNetwork(url, onProgress, onComplete, onError);

    } catch (error) {
      onError(error as Error);
    }
  }

  /**
   * Load from network with progressive levels
   */
  private async loadProgressiveFromNetwork(
    url: string,
    onProgress: (level: number, data: ArrayBuffer) => void,
    onComplete: (data: ArrayBuffer) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    const cacheKey = this.getCacheKey(url);
    let finalData: ArrayBuffer | null = null;

    // Load each progressive level
    for (const level of this.options.progressiveLevels) {
      try {
        const levelUrl = this.buildProgressiveUrl(url, level);
        const data = await this.fetchWithRetry(levelUrl);
        
        // Cache this level
        const cacheEntry: CacheEntry = {
          data,
          timestamp: Date.now(),
          level,
          size: data.byteLength,
          accessCount: 1,
        };

        // Store in memory cache for quick access
        this.addToMemoryCache(`${cacheKey}_level_${level}`, cacheEntry);
        
        // Notify progress
        onProgress(level, data);
        
        finalData = data;
        
        // If this is the highest quality, cache it as the main entry
        if (level === Math.max(...this.options.progressiveLevels)) {
          this.addToMemoryCache(cacheKey, cacheEntry);
          await this.addToIndexedDB(cacheKey, cacheEntry);
        }
        
      } catch (error) {
        console.warn(`Failed to load level ${level}:`, error);
        // Continue with next level
      }
    }

    if (finalData) {
      onComplete(finalData);
    } else {
      onError(new Error('Failed to load any progressive level'));
    }
  }

  /**
   * Fetch with retry logic and timeout
   */
  private async fetchWithRetry(
    url: string,
    maxRetries: number = 3,
    timeout: number = 30000
  ): Promise<ArrayBuffer> {
    let lastError: Error;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'max-age=86400', // Request caching
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.arrayBuffer();

      } catch (error) {
        lastError = error as Error;
        console.warn(`Fetch attempt ${attempt + 1} failed:`, error);
        
        // Exponential backoff
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError!;
  }

  /**
   * Add entry to memory cache with LRU eviction
   */
  private addToMemoryCache(key: string, entry: CacheEntry): void {
    // Check if we need to evict entries
    while (this.currentCacheSize + entry.size > this.options.maxCacheSize && this.memoryCache.size > 0) {
      this.evictLRUEntry();
    }

    // Add new entry
    this.memoryCache.set(key, entry);
    this.currentCacheSize += entry.size;
  }

  /**
   * Evict least recently used entry
   */
  private evictLRUEntry(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.memoryCache) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      const entry = this.memoryCache.get(oldestKey)!;
      this.memoryCache.delete(oldestKey);
      this.currentCacheSize -= entry.size;
    }
  }

  /**
   * Initialize IndexedDB for persistent caching
   */
  private async initializeIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('GeoTIFFCache', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.indexedDBCache = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('geotiff')) {
          const store = db.createObjectStore('geotiff', { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('size', 'size', { unique: false });
        }
      };
    });
  }

  /**
   * Get entry from IndexedDB
   */
  private async getFromIndexedDB(key: string): Promise<CacheEntry | null> {
    if (!this.indexedDBCache) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.indexedDBCache!.transaction(['geotiff'], 'readonly');
      const store = transaction.objectStore('geotiff');
      const request = store.get(key);
      
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          resolve({
            data: result.data,
            timestamp: result.timestamp,
            level: result.level,
            size: result.size,
            accessCount: result.accessCount + 1,
          });
        } else {
          resolve(null);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Add entry to IndexedDB
   */
  private async addToIndexedDB(key: string, entry: CacheEntry): Promise<void> {
    if (!this.indexedDBCache) return;

    return new Promise((resolve, reject) => {
      const transaction = this.indexedDBCache!.transaction(['geotiff'], 'readwrite');
      const store = transaction.objectStore('geotiff');
      
      const request = store.put({
        key,
        data: entry.data,
        timestamp: entry.timestamp,
        level: entry.level,
        size: entry.size,
        accessCount: entry.accessCount,
      });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Initialize Service Worker for network caching
   */
  private async initializeServiceWorker(): Promise<void> {
    if (!this.options.enableServiceWorker || !('serviceWorker' in navigator)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register(
        '/sw-geotiff-cache.js',
        { scope: '/' }
      );
      
      this.serviceWorkerRegistration = registration;
      
      // Update service worker if needed
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      
    } catch (error) {
      console.warn('Service Worker registration failed:', error);
    }
  }

  /**
   * Build progressive URL for different quality levels
   */
  private buildProgressiveUrl(baseUrl: string, level: number): string {
    const url = new URL(baseUrl);
    url.searchParams.set('level', level.toString());
    url.searchParams.set('format', 'progressive');
    return url.toString();
  }

  /**
   * Generate cache key for URL
   */
  private getCacheKey(url: string): string {
    // Remove query parameters that don't affect the content
    const urlObj = new URL(url);
    urlObj.searchParams.delete('_t'); // Remove timestamp params
    return btoa(urlObj.toString()).replace(/[^a-zA-Z0-9]/g, '');
  }

  /**
   * Check if cache entry is still valid
   */
  private isValidCacheEntry(entry: CacheEntry): boolean {
    const age = Date.now() - entry.timestamp;
    return age < this.options.cacheTTL;
  }

  /**
   * Preload GeoTIFF for faster access
   */
  async preload(urls: string[]): Promise<void> {
    const preloadPromises = urls.map(async (url) => {
      try {
        const cacheKey = this.getCacheKey(url);
        
        // Check if already cached
        if (this.memoryCache.has(cacheKey)) return;
        
        const idbEntry = await this.getFromIndexedDB(cacheKey);
        if (idbEntry && this.isValidCacheEntry(idbEntry)) return;
        
        // Preload lowest quality level first
        const firstLevel = this.options.progressiveLevels[0];
        if (firstLevel !== undefined) {
          const previewUrl = this.buildProgressiveUrl(url, firstLevel);
          const data = await this.fetchWithRetry(previewUrl);
          
          const cacheEntry: CacheEntry = {
            data,
            timestamp: Date.now(),
            level: firstLevel,
            size: data.byteLength,
            accessCount: 0,
          };
          
          this.addToMemoryCache(`${cacheKey}_preview`, cacheEntry);
        }
        
      } catch (error) {
        console.warn(`Preload failed for ${url}:`, error);
      }
    });

    await Promise.allSettled(preloadPromises);
  }

  /**
   * Clear all caches
   */
  async clearCache(): Promise<void> {
    // Clear memory cache
    this.memoryCache.clear();
    this.currentCacheSize = 0;

    // Clear IndexedDB cache
    if (this.indexedDBCache) {
      const transaction = this.indexedDBCache.transaction(['geotiff'], 'readwrite');
      const store = transaction.objectStore('geotiff');
      await new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve(undefined);
        request.onerror = () => reject(request.error);
      });
    }

    // Clear Service Worker cache
    if (this.serviceWorkerRegistration) {
      const caches = await window.caches.keys();
      await Promise.all(
        caches.map(cacheName => window.caches.delete(cacheName))
      );
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    memoryUsage: number;
    entriesCount: number;
    hitRate: number;
  } {
    const memoryUsage = Math.round(this.currentCacheSize / 1024 / 1024 * 100) / 100; // MB
    
    return {
      memoryUsage,
      entriesCount: this.memoryCache.size,
      hitRate: 0, // Would calculate hit rate in production
    };
  }
}