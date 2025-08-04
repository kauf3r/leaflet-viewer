# Troubleshooting Guide

## Common Issues and Solutions

### 🚫 Content Security Policy (CSP) Issues

#### Problem: "Refused to load script" or "Refused to create worker"
```
Refused to create a worker from 'blob:...' because it violates CSP directive
```

**Solution**: This is expected in development with strict CSP. The app gracefully falls back to bounds display.

**For Production**: Configure CSP headers to allow Web Workers:
```http
Content-Security-Policy: script-src 'self' 'unsafe-eval'; worker-src 'self' blob:;
```

### 🗺️ GeoTIFF Display Issues

#### Problem: File uploads but doesn't display on map
- **Check projection**: Ensure file has geographic metadata
- **Check coordinates**: Large coordinate values indicate projected system (handled automatically)
- **Check console**: Look for coordinate transformation logs

**Example Success Log**:
```
GeoTIFF is in projected coordinates: EPSG:26910
Original bounds: {north: 4059927, south: 4059232, east: 610374, west: 609727}
Transformed bounds: {north: 36.67, south: 36.66, east: -121.45, west: -121.46}
```

#### Problem: "Inline worker is not supported"
This is expected and handled gracefully. The app will:
1. Try georaster processing with Web Workers
2. Fall back to bounds display with metadata popup
3. Show blue rectangle at correct geographic location

### 📁 File Upload Issues

#### Problem: File rejected during upload
- **Size limit**: Max 1GB per file (configurable)
- **Format**: Only .tif, .tiff, .gtiff files supported
- **Corruption**: File must have valid GeoTIFF headers

#### Problem: Slow processing
- **Large files**: Files >100MB may take time to process
- **Memory**: Browser may need more memory for large files
- **Network**: Check browser network tab for upload progress

### 🔧 Development Issues

#### Problem: TypeScript errors after installing dependencies
```bash
npm run type-check
```
If errors persist, restart TypeScript server in your IDE.

#### Problem: Hydration warnings
```
A tree hydrated but some attributes didn't match
```
This is handled with `suppressHydrationWarning={true}` and `ClientOnly` wrapper.

#### Problem: 404 errors for static assets
Check that these files don't exist in your static assets:
- `/js/leaflet-core.js` (removed)
- `/js/gdal-wasm.js` (removed)
- `/manifest.json` (should exist in public/)

### 🌍 Coordinate System Support

#### Currently Supported Projections
- **EPSG:4326**: WGS84 (Geographic)
- **EPSG:26910**: UTM Zone 10N (California, Nevada, Oregon)
- **EPSG:26911**: UTM Zone 11N (California, Nevada, Utah)
- **EPSG:3857**: Web Mercator

#### Adding New Projections
Edit `src/lib/geotiff-processor.ts` and add to projections object:
```typescript
const projections: { [key: string]: string } = {
  'EPSG:32610': '+proj=utm +zone=10 +datum=WGS84 +units=m +no_defs',
  // Add your projection here
};
```

### 🚀 Performance Tips

#### Optimizing Large File Performance
1. **File Size**: Keep files under 500MB for best performance
2. **Browser Memory**: Close other tabs when processing large files
3. **File Format**: Use Cloud Optimized GeoTIFF (COG) when possible

#### Development Performance
```bash
# Clear browser cache
# Restart development server
npm run dev

# Check bundle size
npx next build --analyze
```

### 🔍 Debugging Tips

#### Enable Debug Logging
The app includes comprehensive console logging. Check browser DevTools → Console for:
- File processing stages
- Coordinate transformation details
- Error messages with specific solutions

#### Common Debug Commands
```bash
# Check all dependencies
npm list

# Verify TypeScript
npm run type-check

# Check for linting issues
npm run lint

# Build verification
npm run build
```

### 📞 Getting Help

If you encounter issues not covered here:

1. **Check Console**: Look for specific error messages
2. **Check Network Tab**: Verify file uploads are completing
3. **Browser Compatibility**: Ensure using Chrome 90+, Firefox 88+, Safari 14+
4. **File Format**: Verify your GeoTIFF files with GDAL: `gdalinfo your-file.tif`

### 🛠️ Development Environment Issues

#### Node.js Version
Ensure you're using Node.js 20.0+ LTS:
```bash
node --version  # Should be 20.x.x or higher
```

#### Package Installation Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Or use specific registry
npm install --registry https://registry.npmjs.org/
```

This troubleshooting guide covers the most common issues encountered during development and deployment of the GeoTIFF viewer.