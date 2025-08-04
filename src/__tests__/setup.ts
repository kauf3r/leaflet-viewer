// Jest setup file for testing environment
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    };
  },
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock Leaflet to avoid DOM issues in tests
jest.mock('leaflet', () => ({
  map: jest.fn(() => ({
    setView: jest.fn(),
    addLayer: jest.fn(),
    removeLayer: jest.fn(),
    fitBounds: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    remove: jest.fn(),
  })),
  tileLayer: jest.fn(() => ({
    addTo: jest.fn(),
  })),
  icon: jest.fn(),
  divIcon: jest.fn(),
  marker: jest.fn(),
  popup: jest.fn(),
  circle: jest.fn(),
  polygon: jest.fn(),
  polyline: jest.fn(),
  rectangle: jest.fn(),
  latLng: jest.fn(),
  latLngBounds: jest.fn(),
}));

// Mock GeoTIFF for testing
jest.mock('geotiff', () => ({
  fromUrl: jest.fn(),
  fromBlob: jest.fn(),
  fromArrayBuffer: jest.fn(),
}));

// Mock GDAL WebAssembly
jest.mock('gdal-js', () => ({
  initializeGdal: jest.fn().mockResolvedValue({}),
  gdal: {
    open: jest.fn(),
    translate: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock Web Workers
Object.defineProperty(window, 'Worker', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    postMessage: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    terminate: jest.fn(),
  })),
});

// Mock IndexedDB
Object.defineProperty(window, 'indexedDB', {
  writable: true,
  value: {
    open: jest.fn().mockResolvedValue({
      transaction: jest.fn(() => ({
        objectStore: jest.fn(() => ({
          add: jest.fn(),
          get: jest.fn(),
          delete: jest.fn(),
          clear: jest.fn(),
        })),
      })),
      close: jest.fn(),
    }),
    deleteDatabase: jest.fn(),
  },
});

// Mock ResizeObserver
Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  })),
});

// Mock IntersectionObserver
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  })),
});

// Mock matchMedia for responsive components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock canvas for map testing
HTMLCanvasElement.prototype.getContext = jest.fn();

// Mock file upload for testing
Object.defineProperty(window, 'File', {
  writable: true,
  value: jest.fn().mockImplementation((parts, name, options) => ({
    name,
    size: parts.reduce((acc, part) => acc + part.length, 0),
    type: options?.type || 'application/octet-stream',
    lastModified: Date.now(),
    arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(0)),
    text: jest.fn().mockResolvedValue(''),
    stream: jest.fn(),
    slice: jest.fn(),
  })),
});

// Mock URL.createObjectURL
Object.defineProperty(window.URL, 'createObjectURL', {
  writable: true,
  value: jest.fn().mockReturnValue('mock-object-url'),
});

Object.defineProperty(window.URL, 'revokeObjectURL', {
  writable: true,
  value: jest.fn(),
});

// Set up console warnings for development
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  // Suppress known warnings in tests
  console.error = (message, ...args) => {
    if (
      typeof message === 'string' &&
      (message.includes('Warning: ReactDOM.render is deprecated') ||
       message.includes('Warning: validateDOMNesting'))
    ) {
      return;
    }
    originalError(message, ...args);
  };

  console.warn = (message, ...args) => {
    if (
      typeof message === 'string' &&
      message.includes('componentWillReceiveProps has been renamed')
    ) {
      return;
    }
    originalWarn(message, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Global test timeout for async operations
jest.setTimeout(30000);