import { geoTIFFProcessor } from '@/lib/geotiff-processor';

// Mock georaster and geotiff modules
jest.mock('georaster', () => {
  return jest.fn().mockResolvedValue({
    height: 1024,
    width: 1024,
    numberOfRasters: 3,
    noDataValue: null,
    pixelHeight: 0.001,
    pixelWidth: 0.001,
    projection: 4326,
    sourceType: 'GeoTIFF',
    xmax: -122.4,
    xmin: -122.5,
    ymax: 37.8,
    ymin: 37.7,
  });
});

jest.mock('geotiff', () => ({
  fromArrayBuffer: jest.fn().mockResolvedValue({
    getImage: jest.fn().mockResolvedValue({
      getWidth: () => 1024,
      getHeight: () => 1024,
      getTileWidth: () => 256,
      getTileHeight: () => 256,
      getSamplesPerPixel: () => 3,
      getBitsPerSample: () => [8, 8, 8],
      getBoundingBox: () => [-122.5, 37.7, -122.4, 37.8],
      getOrigin: () => [-122.5, 37.8],
      getResolution: () => [0.001, -0.001],
      getGeoKeys: () => ({ GeographicTypeGeoKey: 4326 }),
      getGDALNoData: () => null,
    }),
  }),
}));

// Mock file
const createMockFile = (name: string, size: number = 1024 * 1024): File => {
  const buffer = new ArrayBuffer(size);
  const file = new File([buffer], name, { type: 'image/tiff' });
  return file;
};

describe('GeoTIFF Processor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('File Validation', () => {
    it('should accept valid GeoTIFF files', async () => {
      const file = createMockFile('test.tif');
      const isValid = await geoTIFFProcessor.validateGeoTIFF(file);
      expect(isValid).toBe(true);
    });

    it('should reject oversized files', async () => {
      const largeFile = createMockFile('large.tif', 2 * 1024 * 1024 * 1024); // 2GB
      await expect(geoTIFFProcessor.processFile(largeFile)).rejects.toThrow('File size exceeds 1GB limit');
    });

    it('should reject invalid file types', async () => {
      const invalidFile = createMockFile('test.jpg');
      await expect(geoTIFFProcessor.processFile(invalidFile)).rejects.toThrow('Invalid file type');
    });
  });

  describe('File Processing', () => {
    it('should process a valid GeoTIFF file', async () => {
      const file = createMockFile('test.tif');
      const result = await geoTIFFProcessor.processFile(file, { generateThumbnail: true });

      expect(result).toBeDefined();
      expect(result.layer).toBeDefined();
      expect(result.layer.name).toBe('Test');
      expect(result.layer.metadata).toBeDefined();
      expect(result.layer.bounds).toBeDefined();
      expect(result.processingTime).toBeGreaterThan(0);
    });

    it('should generate thumbnails when requested', async () => {
      const file = createMockFile('test.tif');
      const result = await geoTIFFProcessor.processFile(file, { generateThumbnail: true });

      expect(result.thumbnail).toBeDefined();
      expect(result.layer.thumbnail).toBeDefined();
    });

    it('should extract correct metadata', async () => {
      const file = createMockFile('test.tif');
      const result = await geoTIFFProcessor.processFile(file);

      const metadata = result.layer.metadata;
      expect(metadata.width).toBe(1024);
      expect(metadata.height).toBe(1024);
      expect(metadata.samplesPerPixel).toBe(3);
      expect(metadata.projection).toBe('EPSG:4326');
    });

    it('should calculate correct bounds', async () => {
      const file = createMockFile('test.tif');
      const result = await geoTIFFProcessor.processFile(file);

      const bounds = result.layer.bounds;
      expect(bounds.north).toBeCloseTo(37.8, 1);
      expect(bounds.south).toBeCloseTo(37.7, 1);
      expect(bounds.east).toBeCloseTo(-122.4, 1);
      expect(bounds.west).toBeCloseTo(-122.5, 1);
    });
  });

  describe('Capabilities', () => {
    it('should return correct capabilities', () => {
      const capabilities = geoTIFFProcessor.getCapabilities();

      expect(capabilities.maxFileSize).toBe(1024 * 1024 * 1024);
      expect(capabilities.supportedFormats).toEqual(['.tif', '.tiff', '.gtiff']);
      expect(capabilities.features.thumbnailGeneration).toBe(true);
      expect(capabilities.features.metadataExtraction).toBe(true);
      expect(capabilities.features.coordinateTransformation).toBe(true);
    });
  });
});