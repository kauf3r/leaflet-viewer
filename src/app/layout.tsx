import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Optimize font loading for performance
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Improve font loading performance
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false, // Only preload if needed
});

export const metadata: Metadata = {
  title: "GeoTIFF Showcase Tool",
  description: "High-performance GeoTIFF viewer with Leaflet.js",
  keywords: ["GeoTIFF", "mapping", "visualization", "geospatial"],
  authors: [{ name: "Your Name" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Performance optimization hints */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.mapbox.com" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        
        {/* Resource hints for critical assets */}
        <link rel="modulepreload" href="/js/leaflet-core.js" />
        <link rel="prefetch" href="/js/gdal-wasm.js" />
        
        {/* Web App Manifest for PWA capabilities */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        
        {/* Enhanced Performance monitoring initialization */}
        <script dangerouslySetInnerHTML={{
          __html: `
            // Initialize performance monitoring when the page loads
            window.addEventListener('load', function() {
              // Import performance monitor
              import('/src/lib/performance-monitor.js').then(function(module) {
                const { getPerformanceMonitor, reportWebVitals } = module;
                const monitor = getPerformanceMonitor();
                
                // Make reportWebVitals available globally
                window.reportWebVitals = reportWebVitals;
                window.performanceMonitor = monitor;
                
                // Performance marks API
                window.performanceMetrics = {
                  markStart: function(name) {
                    monitor.markStart(name);
                  },
                  markEnd: function(name) {
                    monitor.markEnd(name);
                  },
                  getSummary: function() {
                    return monitor.getPerformanceSummary();
                  },
                  getMemoryStats: function() {
                    return monitor.getMemoryStats();
                  },
                  exportData: function() {
                    return monitor.exportData();
                  }
                };
                
                console.log('Enhanced performance monitoring initialized');
              }).catch(function(err) {
                console.warn('Performance monitoring failed to load:', err);
                
                // Fallback implementation
                window.reportWebVitals = function(metric) {
                  if (navigator.sendBeacon && metric.value !== undefined) {
                    navigator.sendBeacon('/api/analytics/vitals', JSON.stringify({
                      name: metric.name,
                      value: metric.value,
                      id: metric.id || Math.random().toString(36).substr(2, 9),
                      timestamp: Date.now(),
                      url: location.href,
                    }));
                  }
                };
              });
            });
          `
        }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        
        {/* Load Web Vitals tracking */}
        <script dangerouslySetInnerHTML={{
          __html: `
            // Dynamically import web-vitals to avoid blocking
            import('https://cdn.jsdelivr.net/npm/web-vitals@3/dist/web-vitals.js')
              .then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
                getCLS(reportWebVitals);
                getFID(reportWebVitals);
                getFCP(reportWebVitals);
                getLCP(reportWebVitals);
                getTTFB(reportWebVitals);
              })
              .catch((err) => console.warn('Web Vitals loading failed:', err));
          `
        }} />
      </body>
    </html>
  );
}
