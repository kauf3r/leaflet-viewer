import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { WebVitals } from "@/lib/web-vitals";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

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
  robots: "index, follow",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
            {children}
          </Suspense>
          <WebVitals />
        </ThemeProvider>
      </body>
    </html>
  );
}
