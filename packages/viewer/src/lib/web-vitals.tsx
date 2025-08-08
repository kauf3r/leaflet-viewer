"use client";

import { useEffect } from 'react';

export function WebVitals() {
  useEffect(() => {
    const handleWebVitals = async () => {
      try {
        const { onCLS, onFID, onFCP, onLCP, onTTFB } = await import('web-vitals');
        
        const reportWebVitals = (metric: any) => {
          // Log to console in development
          if (process.env.NODE_ENV === 'development') {
            console.log(`[Web Vitals] ${metric.name}:`, metric.value);
          }
          
          // In production, you could send to analytics
          // Example: analytics.track(metric.name, metric.value);
        };

        onCLS(reportWebVitals);
        onFID(reportWebVitals);
        onFCP(reportWebVitals);
        onLCP(reportWebVitals);
        onTTFB(reportWebVitals);
      } catch (error) {
        console.warn('Web Vitals failed to load:', error);
      }
    };

    handleWebVitals();
  }, []);

  return null; // This component doesn't render anything
}