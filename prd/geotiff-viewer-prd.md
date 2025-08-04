# Product Requirements Document: GeoTIFF Showcase Tool

## 1. Executive Summary

### Product Overview
A lightweight, web-based micro tool for showcasing GeoTIFF photogrammetry outputs using Leaflet.js, designed to be built with Claude code assistance. The tool will enable easy visualization and sharing of GeoTIFF files on your website with minimal backend infrastructure.

### Key Value Proposition
- Zero to minimal backend requirements
- Interactive web-based visualization
- Easy embedding and sharing capabilities
- Automated conversion and optimization workflows
- Quick deployment with Claude-generated code

## 2. Problem Statement

### Current Challenges
- GeoTIFF files are large and not web-friendly by default
- Existing viewers require complex setup or expensive licenses
- Difficult to showcase photogrammetry outputs to clients/stakeholders
- No simple way to embed interactive maps on existing websites

### Target Users
- Primary: Your team members who need to showcase photogrammetry outputs
- Secondary: Clients and stakeholders viewing the outputs
- Tertiary: Other teams/departments needing to embed similar visualizations

## 3. Functional Requirements

### Core Features

#### 3.1 GeoTIFF Processing Pipeline
- **Upload/Input Methods**
  - Direct file upload interface
  - URL input for hosted GeoTIFFs
  - Batch upload support for multiple files
  
- **Conversion Capabilities**
  - Automatic conversion to Cloud Optimized GeoTIFF (COG) format
  - Tile generation for large files
  - Thumbnail generation for preview
  - Metadata extraction and display

#### 3.2 Visualization Features
- **Map Display**
  - Interactive pan and zoom
  - Layer toggle controls
  - Opacity adjustment slider
  - Full-screen mode
  
- **Comparison Tools**
  - Side-by-side viewer for multiple GeoTIFFs
  - Swipe/slider comparison mode
  - Synchronized pan/zoom for comparisons
  
- **Annotation & Measurement**
  - Basic drawing tools (points, lines, polygons)
  - Distance and area measurement
  - Pop-up information displays
  - Export annotations as GeoJSON

#### 3.3 Sharing & Embedding
- **Output Options**
  - Shareable link generation
  - Iframe embed code
  - Static image export (PNG/JPEG)
  - Direct download of processed files
  
- **Customization**
  - Adjustable viewer dimensions
  - Theme options (light/dark)
  - Logo/branding placement
  - Custom base map selection

### Nice-to-Have Features
- Time-series animation for multiple captures
- 3D terrain visualization
- Advanced analytics (NDVI, elevation profiles)
- User authentication for private projects
- Comments and collaboration features

## 4. Technical Requirements

### Frontend Architecture
- **Core Technologies**
  - Leaflet.js (latest stable version)
  - Plugins: Leaflet.GeoRaster, Leaflet.Sync
  - Pure JavaScript (no build tools required)
  - Responsive CSS framework (optional)

### Backend/Processing
- **Minimal Backend Option**
  - Static hosting only (GitHub Pages, Netlify)
  - Client-side processing with WebAssembly GDAL
  
- **Enhanced Backend Option**
  - Node.js microservice for heavy processing
  - Python scripts for GDAL operations
  - Serverless functions for on-demand conversion

### Data Storage
- **Cloud Storage Integration**
  - Support for S3, Google Cloud Storage, Azure Blob
  - COG hosting for streaming
  - CDN integration for performance

### Performance Requirements
- Initial load time < 3 seconds
- Smooth pan/zoom at 60fps
- Support for GeoTIFFs up to 1GB
- Concurrent viewing of 2-4 layers

## 5. Claude Code Integration Strategy

### Development Workflow
1. **Initial Scaffolding**
   - Claude generates base HTML/CSS/JS structure
   - Leaflet.js integration boilerplate
   - Basic UI components

2. **Feature Implementation**
   - Claude writes individual feature modules
   - Processing scripts (Python/Node.js)
   - Conversion utilities

3. **Testing & Refinement**
   - Claude generates test cases
   - Performance optimization suggestions
   - Cross-browser compatibility fixes

### Code Generation Patterns
```javascript
// Example Claude prompt pattern
"Generate a Leaflet.js viewer that:
- Loads a COG from URL
- Includes zoom controls
- Has an opacity slider
- Exports as self-contained HTML"
```

## 6. User Interface Design

### Layout Components
- **Header Bar**
  - Logo/branding
  - File upload button
  - Share/export menu
  
- **Map Container**
  - Full viewport with margins
  - Floating controls
  - Scale bar and coordinates
  
- **Control Panel**
  - Collapsible sidebar
  - Layer management
  - Tool selection
  - Settings/options

### Responsive Behavior
- Desktop: Full features, multi-panel layout
- Tablet: Simplified controls, touch gestures
- Mobile: Essential features, full-screen map

## 7. Implementation Phases

### Phase 1: MVP (Week 1-2)
- Basic Leaflet.js viewer
- Single GeoTIFF display
- COG support
- Simple sharing link

### Phase 2: Core Features (Week 3-4)
- Multiple layer support
- Comparison tools
- Basic annotations
- Embed functionality

### Phase 3: Enhancement (Week 5-6)
- Processing pipeline
- Advanced controls
- Performance optimization
- Documentation

## 8. Success Metrics

### Technical Metrics
- Page load time < 3s
- 95% browser compatibility
- Zero runtime errors
- < 500KB initial bundle size

### User Metrics
- Time to first map view < 10s
- Successful embed rate > 90%
- Average session duration > 2 minutes
- Feature adoption rates

## 9. Maintenance & Support

### Documentation Needs
- User guide with screenshots
- Embed integration guide
- API documentation (if applicable)
- Troubleshooting FAQ

### Update Strategy
- Monthly security patches
- Quarterly feature updates
- Annual major version releases
- Automated dependency updates

## 10. Example Code Structure

```
geotiff-viewer/
├── index.html
├── css/
│   └── viewer.css
├── js/
│   ├── viewer.js
│   ├── controls.js
│   ├── processing.js
│   └── sharing.js
├── assets/
│   └── icons/
└── examples/
    ├── basic.html
    ├── comparison.html
    └── embedded.html
```

## 11. Getting Started Checklist

- [ ] Set up development environment
- [ ] Create GitHub repository
- [ ] Initialize Leaflet.js project with Claude
- [ ] Implement basic viewer
- [ ] Add COG support
- [ ] Test with sample GeoTIFFs
- [ ] Deploy to static hosting
- [ ] Create documentation
- [ ] Gather user feedback
- [ ] Iterate and improve

## 12. Appendix A: Technical Specifications

### Supported File Formats
- Standard GeoTIFF (.tif, .tiff)
- Cloud Optimized GeoTIFF (COG)
- BigTIFF (files > 4GB)

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Dependencies
- Leaflet.js 1.9.x
- GeoRaster 1.x
- GeoRasterLayer for Leaflet
- Leaflet.Sync (for comparison)
- Leaflet.Draw (for annotations)

## 13. Appendix B: GDAL Commands for Processing

### Convert to COG
```bash
gdal_translate input.tif output_cog.tif -of COG -co COMPRESS=LZW
```

### Generate Tiles
```bash
gdal2tiles.py -p mercator -z 1-18 input_cog.tif output_tiles/
```

### Extract Metadata
```bash
gdalinfo input.tif > metadata.txt
```

## 14. Appendix C: Sample Implementation Code

### Basic Viewer Setup
```javascript
// Initialize map with GeoTIFF
const map = L.map('map').setView([0, 0], 2);

// Add base layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Load GeoTIFF
fetch('path/to/geotiff.tif')
  .then(response => response.arrayBuffer())
  .then(arrayBuffer => parseGeoraster(arrayBuffer))
  .then(georaster => {
    const layer = new GeoRasterLayer({
      georaster: georaster,
      opacity: 1,
      resolution: 256
    });
    layer.addTo(map);
    map.fitBounds(layer.getBounds());
  });
```

### Embed Code Template
```html
<iframe 
  src="https://yourdomain.com/geotiff-viewer?url=YOUR_COG_URL" 
  width="800" 
  height="600" 
  frameborder="0" 
  allowfullscreen>
</iframe>
```

## 15. Conclusion

This PRD provides a comprehensive roadmap for building a GeoTIFF showcase tool using Leaflet.js with Claude code assistance. The modular approach allows for iterative development, starting with core functionality and expanding based on user needs. The focus on minimal backend requirements and easy embedding makes this solution ideal for quick deployment and widespread adoption within your organization.