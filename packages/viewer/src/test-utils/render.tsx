import React, { ReactElement } from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { renderHook as rtlRenderHook, RenderHookOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  /**
   * Optional query client for React Query testing
   */
  queryClient?: QueryClient;
  /**
   * Additional wrapper component
   */
  wrapper?: React.ComponentType<{ children: React.ReactNode }>;
}

/**
 * Custom render function with providers setup
 * Includes React Query provider and other global providers
 */
export function render(ui: ReactElement, options: CustomRenderOptions = {}) {
  const { queryClient, wrapper: Wrapper, ...renderOptions } = options;

  // Create a fresh query client for each test if not provided
  const testQueryClient = queryClient || new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  // Combined wrapper that includes all providers
  function CombinedWrapper({ children }: { children: React.ReactNode }) {
    let content = (
      <QueryClientProvider client={testQueryClient}>
        {children}
      </QueryClientProvider>
    );

    if (Wrapper) {
      content = <Wrapper>{content}</Wrapper>;
    }

    return content;
  }

  return {
    ...rtlRender(ui, { wrapper: CombinedWrapper, ...renderOptions }),
    queryClient: testQueryClient,
  };
}

/**
 * Custom renderHook function with providers setup
 */
export function renderHook<Result, Props>(
  renderCallback: (initialProps: Props) => Result,
  options: RenderHookOptions<Props> & { queryClient?: QueryClient } = {}
) {
  const { queryClient, wrapper: Wrapper, ...renderOptions } = options;

  // Create a fresh query client for each test if not provided
  const testQueryClient = queryClient || new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  // Combined wrapper that includes all providers
  function CombinedWrapper({ children }: { children: React.ReactNode }) {
    let content = (
      <QueryClientProvider client={testQueryClient}>
        {children}
      </QueryClientProvider>
    );

    if (Wrapper) {
      content = <Wrapper>{content}</Wrapper>;
    }

    return content;
  }

  return {
    ...rtlRenderHook(renderCallback, { wrapper: CombinedWrapper, ...renderOptions }),
    queryClient: testQueryClient,
  };
}

/**
 * Create a mock file for testing file uploads
 */
export function createMockFile(
  name: string = 'test.tif',
  size: number = 1024,
  type: string = 'image/tiff'
): File {
  const content = new Array(size).fill('a').join('');
  return new File([content], name, { type });
}

/**
 * Create a mock GeoTIFF file for testing
 */
export function createMockGeoTIFF(
  name: string = 'test.tif',
  width: number = 256,
  height: number = 256
): File {
  // Create a minimal GeoTIFF-like file structure
  const headerSize = 1024;
  const imageDataSize = width * height * 3; // RGB
  const totalSize = headerSize + imageDataSize;
  
  const buffer = new ArrayBuffer(totalSize);
  const view = new Uint8Array(buffer);
  
  // Add GeoTIFF magic bytes (II for little endian)
  view[0] = 0x49; // 'I'
  view[1] = 0x49; // 'I'
  view[2] = 0x2A; // TIFF magic number
  view[3] = 0x00;
  
  // Add some mock image data
  for (let i = headerSize; i < totalSize; i++) {
    view[i] = Math.floor(Math.random() * 256);
  }
  
  return new File([buffer], name, { type: 'image/tiff' });
}

/**
 * Wait for async operations to complete
 */
export function waitForAsync(ms: number = 0): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Mock console methods for testing
 */
export function mockConsole() {
  const originalConsole = { ...console };
  
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  return originalConsole;
}

/**
 * Mock IntersectionObserver for component testing
 */
export function mockIntersectionObserver() {
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: mockIntersectionObserver,
  });
  
  Object.defineProperty(global, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: mockIntersectionObserver,
  });
  
  return mockIntersectionObserver;
}

/**
 * Mock ResizeObserver for component testing
 */
export function mockResizeObserver() {
  const mockResizeObserver = jest.fn();
  mockResizeObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  
  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: mockResizeObserver,
  });
  
  return mockResizeObserver;
}