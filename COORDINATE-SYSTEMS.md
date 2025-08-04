# Coordinate Systems & Transformation Guide

## Overview

The GeoTIFF Viewer automatically detects and transforms projected coordinate systems to WGS84 (EPSG:4326) for proper web map display using the proj4 library.

## Supported Coordinate Systems

### ✅ Fully Supported
- **EPSG:4326** - WGS84 Geographic (Latitude/Longitude)
- **EPSG:26910** - UTM Zone 10N (NAD83) - California, Nevada, Oregon
- **EPSG:26911** - UTM Zone 11N (NAD83) - California, Nevada, Utah  
- **EPSG:3857** - Web Mercator (Pseudo-Mercator)

### 🔧 How It Works

#### 1. Automatic Detection
The system detects projected coordinates when values exceed geographic bounds:
```typescript
const isProjected = Math.abs(west) > 180 || Math.abs(east) > 180 || 
                   Math.abs(north) > 90 || Math.abs(south) > 90;
```

#### 2. Coordinate Transformation
Using proj4, coordinates are transformed from source projection to WGS84:
```typescript
// Example: UTM Zone 10N to WGS84
const sourceProj = '+proj=utm +zone=10 +datum=NAD83 +units=m +no_defs';
const targetProj = '+proj=longlat +datum=WGS84 +no_defs';
const [lng, lat] = proj4(sourceProj, targetProj, [easting, northing]);
```

#### 3. Real-World Example
NAIP imagery in UTM Zone 10N:
```
Original bounds: {north: 4059927, south: 4059232, east: 610374, west: 609727}
Transformed:     {north: 36.67, south: 36.66, east: -121.45, west: -121.46}
```

## Implementation Details

### File: `src/lib/geotiff-processor.ts`

#### Detection Logic
```typescript
private calculateBounds(metadata: GeoTIFFMetadata): GeoTIFFBounds {
  // Calculate original bounds
  const west = origin[0];
  const north = origin[1]; 
  const east = west + (width * Math.abs(resolution[0]));
  const south = north - (height * Math.abs(resolution[1]));

  // Check if projected
  const isProjected = Math.abs(west) > 180 || Math.abs(east) > 180 || 
                     Math.abs(north) > 90 || Math.abs(south) > 90;
  
  if (isProjected) {
    return this.transformBounds({ north, south, east, west }, projection);
  }
  
  return { north, south, east, west };
}
```

#### Transformation Method
```typescript
private transformBounds(bounds: GeoTIFFBounds, fromProjection: string): GeoTIFFBounds {
  const projections = {
    'EPSG:26910': '+proj=utm +zone=10 +datum=NAD83 +units=m +no_defs',
    'EPSG:26911': '+proj=utm +zone=11 +datum=NAD83 +units=m +no_defs',
    'EPSG:3857': '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs',
    'EPSG:4326': '+proj=longlat +datum=WGS84 +no_defs',
  };
  
  const sourceProj = projections[fromProjection];
  const targetProj = '+proj=longlat +datum=WGS84 +no_defs';
  
  const [swLng, swLat] = proj4(sourceProj, targetProj, [bounds.west, bounds.south]);
  const [neLng, neLat] = proj4(sourceProj, targetProj, [bounds.east, bounds.north]);
  
  return { north: neLat, south: swLat, east: neLng, west: swLng };
}
```

## Adding New Coordinate Systems

### Step 1: Add Projection Definition
Edit the `projections` object in `geotiff-processor.ts`:

```typescript
const projections: { [key: string]: string } = {
  'EPSG:26910': '+proj=utm +zone=10 +datum=NAD83 +units=m +no_defs',
  'EPSG:32633': '+proj=utm +zone=33 +datum=WGS84 +units=m +no_defs', // New: UTM 33N
  'EPSG:2154': '+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs', // New: RGF93 / Lambert-93
};
```

### Step 2: Find Projection Parameters
Use [EPSG.io](https://epsg.io/) or [spatialreference.org](https://spatialreference.org/) to find proj4 strings.

Example for EPSG:32633 (UTM Zone 33N):
```
+proj=utm +zone=33 +datum=WGS84 +units=m +no_defs +type=crs
```

### Step 3: Test with Sample Data
Upload a GeoTIFF file in the new projection and verify:
1. Console shows correct projection detection
2. Bounds are transformed properly
3. Map centers on correct geographic location

## Common Projections by Region

### United States
- **EPSG:26910** - UTM Zone 10N (California, Nevada, Oregon)
- **EPSG:26911** - UTM Zone 11N (California, Nevada, Utah)
- **EPSG:26912** - UTM Zone 12N (Nevada, Utah, Colorado)
- **EPSG:4269** - NAD83 Geographic
- **EPSG:3857** - Web Mercator

### Europe
- **EPSG:32633** - UTM Zone 33N (Most of Europe)
- **EPSG:3035** - ETRS89 / LAEA Europe
- **EPSG:4326** - WGS84 Geographic

### Global
- **EPSG:4326** - WGS84 Geographic (Global)
- **EPSG:3857** - Web Mercator (Web mapping)

## Debugging Coordinate Issues

### Check Console Output
Look for these messages:
```
GeoTIFF is in projected coordinates: EPSG:26910
Original bounds: {north: 4059927, south: 4059232, east: 610374, west: 609727}
Transformed bounds: {north: 36.67, south: 36.66, east: -121.45, west: -121.46}
```

### Verify with GDAL
Use GDAL tools to inspect your files:
```bash
# Check projection
gdalinfo your-file.tif

# Reproject if needed
gdalwarp -t_srs EPSG:4326 input.tif output.tif
```

### Common Issues
1. **Missing projection info**: File has no embedded CRS data
2. **Unknown projection**: EPSG code not in our definitions
3. **Invalid coordinates**: Coordinates don't match expected projection

## Best Practices

### For Data Providers
1. **Embed CRS information** in GeoTIFF files
2. **Use standard EPSG codes** when possible
3. **Test files** with multiple GIS software
4. **Provide metadata** about coordinate system used

### For Developers
1. **Log transformation details** for debugging
2. **Validate transformed coordinates** are reasonable
3. **Handle edge cases** (polar regions, antimeridian)
4. **Provide user feedback** for unsupported projections

This coordinate system implementation ensures that GeoTIFF files from various sources can be properly displayed on web maps regardless of their original projection.