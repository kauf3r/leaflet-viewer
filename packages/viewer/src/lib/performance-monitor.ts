/**
 * Enhanced Performance Monitoring System
 * Provides comprehensive performance tracking and optimization insights
 */

import { PerformanceMetrics, MemoryMetrics, LoadingPerformance, CacheStatistics } from '@/types';

interface PerformanceObserverEntry {
  name: string;
  entryType: string;
  startTime: number;
  duration: number;
}

interface PerformanceObserverOptions {
  enableMemoryTracking: boolean;
  enableResourceTracking: boolean;
  enableUserTiming: boolean;
  memoryCheckInterval: number; // milliseconds
  alertThresholds: {
    memoryUsage: number; // percentage
    longTask: number; // milliseconds
    cacheSize: number; // MB
  };
}

export class PerformanceMonitor {
  private performanceData: PerformanceMetrics[] = [];
  private memoryData: MemoryMetrics[] = [];
  private loadingData: LoadingPerformance[] = [];
  private observers: PerformanceObserver[] = [];
  private memoryInterval: NodeJS.Timeout | null = null;
  private options: PerformanceObserverOptions;

  constructor(options: Partial<PerformanceObserverOptions> = {}) {
    this.options = {
      enableMemoryTracking: true,
      enableResourceTracking: true,
      enableUserTiming: true,
      memoryCheckInterval: 10000, // 10 seconds
      alertThresholds: {
        memoryUsage: 90, // 90%
        longTask: 50, // 50ms
        cacheSize: 200, // 200MB
      },
      ...options,
    };

    this.initialize();
  }

  /**
   * Initialize performance monitoring
   */
  private initialize(): void {
    if (typeof window === 'undefined') return;

    this.setupWebVitalsTracking();
    this.setupResourceTracking();
    this.setupLongTaskTracking();
    this.setupUserTimingTracking();
    
    if (this.options.enableMemoryTracking) {
      this.setupMemoryTracking();
    }
  }

  /**
   * Setup Web Vitals tracking (LCP, FID, CLS, FCP, TTFB)
   */
  private setupWebVitalsTracking(): void {
    try {
      if ('PerformanceObserver' in window) {
        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            this.recordMetric({
              name: 'LCP',
              value: lastEntry.startTime,
              id: this.generateId(),
              timestamp: Date.now(),
              url: window.location.href,
            });
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);

        // First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            this.recordMetric({
              name: 'FID',
              value: (entry as any).processingStart - entry.startTime,
              id: this.generateId(),
              timestamp: Date.now(),
              url: window.location.href,
            });
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);

        // Cumulative Layout Shift
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          const entries = list.getEntries();
          entries.forEach((entry) => {
            const layoutShiftEntry = entry as any;
            if (!layoutShiftEntry.hadRecentInput) {
              clsValue += layoutShiftEntry.value;
            }
          });
          
          if (clsValue > 0) {
            this.recordMetric({
              name: 'CLS',
              value: clsValue,
              id: this.generateId(),
              timestamp: Date.now(),
              url: window.location.href,
            });
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      }
    } catch (error) {
      console.warn('Web Vitals tracking setup failed:', error);
    }
  }

  /**
   * Setup resource loading tracking
   */
  private setupResourceTracking(): void {
    if (!this.options.enableResourceTracking) return;

    try {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const resourceEntry = entry as any;
          this.recordMetric({
            name: `resource-${resourceEntry.initiatorType || 'unknown'}`,
            value: entry.duration || 0,
            id: this.generateId(),
            timestamp: Date.now(),
            url: resourceEntry.name || window.location.href,
          });

          // Track slow resources
          if (entry.duration > 1000) { // > 1 second
            console.warn(`Slow resource detected: ${entry.name} took ${entry.duration}ms`);
          }
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);
    } catch (error) {
      console.warn('Resource tracking setup failed:', error);
    }
  }

  /**
   * Setup long task tracking
   */
  private setupLongTaskTracking(): void {
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordMetric({
            name: 'long-task',
            value: entry.duration,
            id: this.generateId(),
            timestamp: Date.now(),
            url: window.location.href,
          });

          if (entry.duration > this.options.alertThresholds.longTask) {
            console.warn(`Long task detected: ${entry.duration}ms`);
          }
        });
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
      this.observers.push(longTaskObserver);
    } catch (error) {
      console.warn('Long task tracking setup failed:', error);
    }
  }

  /**
   * Setup user timing tracking (performance.mark/measure)
   */
  private setupUserTimingTracking(): void {
    if (!this.options.enableUserTiming) return;

    try {
      const userTimingObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordMetric({
            name: `user-timing-${entry.name}`,
            value: entry.duration || entry.startTime,
            id: this.generateId(),
            timestamp: Date.now(),
            url: window.location.href,
          });
        });
      });
      userTimingObserver.observe({ entryTypes: ['mark', 'measure'] });
      this.observers.push(userTimingObserver);
    } catch (error) {
      console.warn('User timing tracking setup failed:', error);
    }
  }

  /**
   * Setup memory usage tracking
   */
  private setupMemoryTracking(): void {
    if (typeof window === 'undefined' || !('memory' in performance)) return;

    this.memoryInterval = setInterval(() => {
      const memory = (performance as any).memory;
      if (memory) {
        const memoryMetrics: MemoryMetrics = {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          timestamp: Date.now(),
        };

        this.memoryData.push(memoryMetrics);

        // Alert on high memory usage
        const usagePercentage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        if (usagePercentage > this.options.alertThresholds.memoryUsage) {
          console.warn(`High memory usage detected: ${usagePercentage.toFixed(1)}%`);
        }

        // Keep only last 100 entries
        if (this.memoryData.length > 100) {
          this.memoryData = this.memoryData.slice(-100);
        }
      }
    }, this.options.memoryCheckInterval);
  }

  /**
   * Record a performance metric
   */
  private recordMetric(metric: PerformanceMetrics): void {
    this.performanceData.push(metric);

    // Send to analytics endpoint if available
    if (navigator.sendBeacon) {
      try {
        navigator.sendBeacon('/api/analytics/performance', JSON.stringify(metric));
      } catch (error) {
        // Fail silently
      }
    }

    // Keep only last 1000 entries
    if (this.performanceData.length > 1000) {
      this.performanceData = this.performanceData.slice(-1000);
    }
  }

  /**
   * Record component loading performance
   */
  public recordComponentLoad(componentName: string, loadTime: number, cacheHit: boolean = false, bundleSize?: number): void {
    const loadingMetric: LoadingPerformance = {
      componentName,
      loadTime,
      cacheHit,
      bundleSize: bundleSize || undefined,
      timestamp: Date.now(),
    };

    this.loadingData.push(loadingMetric);

    // Keep only last 500 entries
    if (this.loadingData.length > 500) {
      this.loadingData = this.loadingData.slice(-500);
    }
  }

  /**
   * Mark the start of a custom performance measurement
   */
  public markStart(name: string): void {
    if ('performance' in window && performance.mark) {
      performance.mark(`${name}-start`);
    }
  }

  /**
   * Mark the end of a custom performance measurement
   */
  public markEnd(name: string): void {
    if ('performance' in window && performance.mark && performance.measure) {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
    }
  }

  /**
   * Get performance summary
   */
  public getPerformanceSummary(): {
    totalMetrics: number;
    averageLoadTime: number;
    slowestOperations: PerformanceMetrics[];
    memoryTrend: 'stable' | 'increasing' | 'decreasing';
    cacheHitRate: number;
  } {
    const loadTimes = this.performanceData.map(m => m.value).filter(v => v > 0);
    const averageLoadTime = loadTimes.length > 0 ? loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length : 0;
    
    const slowestOperations = this.performanceData
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // Calculate memory trend
    let memoryTrend: 'stable' | 'increasing' | 'decreasing' = 'stable';
    if (this.memoryData.length > 10) {
      const recent = this.memoryData.slice(-10);
      const older = this.memoryData.slice(-20, -10);
      const recentAvg = recent.reduce((sum, m) => sum + m.usedJSHeapSize, 0) / recent.length;
      const olderAvg = older.reduce((sum, m) => sum + m.usedJSHeapSize, 0) / older.length;
      
      if (recentAvg > olderAvg * 1.1) memoryTrend = 'increasing';
      else if (recentAvg < olderAvg * 0.9) memoryTrend = 'decreasing';
    }

    // Calculate cache hit rate
    const cacheHits = this.loadingData.filter(l => l.cacheHit).length;
    const cacheHitRate = this.loadingData.length > 0 ? (cacheHits / this.loadingData.length) * 100 : 0;

    return {
      totalMetrics: this.performanceData.length,
      averageLoadTime,
      slowestOperations,
      memoryTrend,
      cacheHitRate,
    };
  }

  /**
   * Get current memory statistics
   */
  public getMemoryStats(): MemoryMetrics | null {
    if (this.memoryData.length === 0) return null;
    return this.memoryData[this.memoryData.length - 1] || null;
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): CacheStatistics {
    const cacheHits = this.loadingData.filter(l => l.cacheHit).length;
    const totalRequests = this.loadingData.length;
    const hitRate = totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0;

    return {
      size: 0, // This would be calculated by cache implementation
      entries: 0, // This would be calculated by cache implementation
      hitRate,
      memoryUsage: this.getMemoryStats()?.usedJSHeapSize ? 
        Math.round(this.getMemoryStats()!.usedJSHeapSize / 1024 / 1024) : 0,
    };
  }

  /**
   * Export performance data for analysis
   */
  public exportData(): {
    metrics: PerformanceMetrics[];
    memory: MemoryMetrics[];
    loading: LoadingPerformance[];
    summary: ReturnType<PerformanceMonitor['getPerformanceSummary']>;
  } {
    return {
      metrics: [...this.performanceData],
      memory: [...this.memoryData],
      loading: [...this.loadingData],
      summary: this.getPerformanceSummary(),
    };
  }

  /**
   * Clear all performance data
   */
  public clearData(): void {
    this.performanceData = [];
    this.memoryData = [];
    this.loadingData = [];
  }

  /**
   * Cleanup observers and intervals
   */
  public dispose(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];

    if (this.memoryInterval) {
      clearInterval(this.memoryInterval);
      this.memoryInterval = null;
    }

    this.clearData();
  }

  /**
   * Generate unique ID for metrics
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

// Global performance monitor instance
let globalPerformanceMonitor: PerformanceMonitor | null = null;

/**
 * Get the global performance monitor instance
 */
export function getPerformanceMonitor(): PerformanceMonitor {
  if (!globalPerformanceMonitor) {
    globalPerformanceMonitor = new PerformanceMonitor();
  }
  return globalPerformanceMonitor;
}

/**
 * Enhanced Web Vitals reporting function
 */
export function reportWebVitals(metric: PerformanceMetrics): void {
  const monitor = getPerformanceMonitor();
  
  // Add connection information if available
  const connection = (navigator as any).connection;
  if (connection) {
    metric.connection = {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
    };
  }

  // Add user agent
  metric.userAgent = navigator.userAgent;

  // Record the metric
  monitor['recordMetric'](metric);

  // Console log for debugging
  console.log(`Web Vital: ${metric.name}`, metric);
}

/**
 * Performance decorator for async functions
 */
export function withPerformanceTracking<T extends any[], R>(
  name: string,
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    const monitor = getPerformanceMonitor();
    monitor.markStart(name);
    
    try {
      const result = await fn(...args);
      monitor.markEnd(name);
      return result;
    } catch (error) {
      monitor.markEnd(name);
      throw error;
    }
  };
}

/**
 * Performance decorator for sync functions
 */
export function withSyncPerformanceTracking<T extends any[], R>(
  name: string,
  fn: (...args: T) => R
): (...args: T) => R {
  return (...args: T): R => {
    const monitor = getPerformanceMonitor();
    monitor.markStart(name);
    
    try {
      const result = fn(...args);
      monitor.markEnd(name);
      return result;
    } catch (error) {
      monitor.markEnd(name);
      throw error;
    }
  };
}