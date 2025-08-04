import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bundle optimization for GeoTIFF tool
  experimental: {
    webpackMemoryOptimizations: true,
    optimizePackageImports: ['leaflet', 'geotiff', '@radix-ui/react-select']
  },
  
  // Enable compression and optimizations
  compress: true,
  poweredByHeader: false,
  
  // Webpack optimizations for large GeoTIFF files
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle splitting for mapping components
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // Separate chunk for Leaflet and mapping libraries
          mapping: {
            test: /[\\/]node_modules[\\/](leaflet|geotiff|gdal-js)[\\/]/,
            name: 'mapping',
            chunks: 'all',
            priority: 10,
          },
          // Separate chunk for heavy GDAL WebAssembly
          gdal: {
            test: /[\\/]node_modules[\\/]gdal-js[\\/]/,
            name: 'gdal-wasm',
            chunks: 'async', // Only load when needed
            priority: 20,
          },
          // UI components chunk
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
            name: 'ui',
            chunks: 'all',
            priority: 5,
          }
        }
      };
    }

    // Handle WebAssembly files for GDAL
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      syncWebAssembly: true,
    };

    // Optimize for large file handling
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };

    return config;
  },

  // Security and performance headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security headers
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // unsafe-eval needed for GDAL WebAssembly
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' https:",
              "media-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
          // Performance headers
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
      {
        source: '/api/geotiff/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*.(tif|tiff|gtiff)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  }
};

export default nextConfig;
