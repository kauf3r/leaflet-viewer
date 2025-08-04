# GeoTIFF Showcase Tool

A powerful, web-based visualization tool for showcasing GeoTIFF photogrammetry outputs using Leaflet.js. Built with Next.js and **now supports enterprise-scale files up to 50GB+** with cloud-based processing and tile streaming.

![Project Status](https://img.shields.io/badge/status-production%20ready-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15+-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)
![Leaflet](https://img.shields.io/badge/Leaflet.js-1.9+-green)

## 🌟 Vision

Transform complex geospatial data into compelling visual stories that drive decision-making, client engagement, and project success through an intuitive, fast, and embeddable web platform.

**The "Figma for Geospatial Data"** - simple, powerful, collaborative.

## ✨ Key Features

### Current (v1.0.1 Production Ready) 🎉
- ✅ **Real GeoTIFF Processing**: Full metadata extraction with geotiff.js library
- ✅ **Advanced Coordinate Transformation**: UTM to WGS84 conversion with proj4
- ✅ **Interactive File Upload**: Drag-and-drop with real-time validation and progress
- ✅ **Professional Layer Management**: Opacity controls, visibility toggles, detailed metadata display
- ✅ **Projected Coordinate Support**: Automatic EPSG:26910 (UTM Zone 10N) transformation
- ✅ **Enterprise-Grade Architecture**: TypeScript, Zustand state management, performance monitoring
- ✅ **Production-Ready Foundation**: PWA manifest, CSP compliance, hydration handling
- ✅ **Build System**: Clean TypeScript builds, working ESLint, comprehensive test suite
- ✅ **Development Experience**: Hot reload, error handling, performance monitoring

### Planned Implementation

#### Phase 1.5: Enterprise Infrastructure (Weeks 3-4)
- 🔄 **Large File Support**: Chunked upload for 50GB+ files  
- 🔄 **Server-Side Processing**: GDAL processing and COG conversion
- 🔄 **Tile Streaming**: Progressive loading with multiple quality levels
- 🔄 **Cloud Integration**: AWS S3/Google Cloud/Azure storage

#### Phase 2: Advanced Features (Weeks 5-6)  
- 📋 **Multi-Layer Comparison**: Support for 4-8 concurrent large layers
- 📋 **Comparison Tools**: Side-by-side and swipe modes with tile alignment
- 📋 **Performance Optimization**: Handle 50GB+ files at 60fps
- 📋 **Annotation Tools**: Drawing, measurement, and collaborative features

#### Phase 3: Enterprise Features (Weeks 7-8)
- 📋 **Batch Processing**: Multiple file processing queues
- 📋 **Advanced Analytics**: Statistical analysis, change detection
- 📋 **White-Label Deployment**: Custom branding and embedding
- 📋 **API & SDK**: Developer tools for integration

## 🎯 Target Users

### 👥 Primary: Photogrammetry Professionals
- Drone survey operators showcasing aerial survey results
- Surveying companies presenting topographic analysis
- Environmental consultants visualizing change detection

### 🏢 Secondary: Clients & Stakeholders
- Property developers understanding site conditions
- Government officials reviewing environmental assessments
- Project managers tracking progress validation

### 🔧 Tertiary: Developers & Integrators
- Agency developers embedding viewers in client sites
- SaaS platform builders integrating spatial visualization
- IT teams deploying enterprise spatial solutions

## 🚀 Quick Start

### Prerequisites

#### For Client-Side Development
- Node.js 20.0+ LTS
- Git 2.40.0+
- Modern browser (Chrome 90+, Firefox 88+, Safari 14+)
- GeoTIFF files in supported projections (WGS84, UTM Zone 10N tested)

#### For Enterprise/Large File Support
- **Cloud Storage**: AWS S3, Google Cloud Storage, or Azure Blob Storage
- **Database**: PostgreSQL 15+ (managed service recommended)
- **Cache/Queue**: Redis 7+ (managed service recommended)
- **Processing Server**: 16GB+ RAM, SSD storage for GDAL operations
- **CDN**: CloudFlare, AWS CloudFront, or Google Cloud CDN

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/leaflet-viewer.git
cd leaflet-viewer

# Install dependencies (includes geospatial libraries)
npm install

# Run development server
npm run dev

# Open browser and upload GeoTIFF files
# - Click "Upload GeoTIFF" button
# - Drag & drop .tif/.tiff files
# - View with automatic coordinate transformation
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Optional: Install CCPlugins
Enhance your Claude Code CLI experience with professional commands:

```bash
# Mac/Linux
curl -sSL https://raw.githubusercontent.com/brennercruvinel/CCPlugins/main/install.sh | bash

# Verify installation
ls ~/.claude/commands/  # Should show 24 .md command files
```

## 🛠️ Technology Stack

### Core Framework
- **Next.js 15+**: React framework with App Router, SSR/SSG capabilities
- **React 18+**: Component-based architecture
- **TypeScript 5+**: Enhanced developer experience and type safety

### Styling & UI
- **Tailwind CSS 3.4+**: Utility-first CSS framework
- **shadcn/ui**: Accessible, customizable component library
- **Radix UI**: Headless UI primitives with ARIA compliance
- **Lucide React**: Consistent iconography

### Mapping & Geospatial
- **Leaflet.js 1.9+**: Interactive maps with SSR-safe implementation
- **GeoTIFF.js 2.1.0**: Real metadata extraction and file validation
- **georaster 1.6.0**: Raster data processing and thumbnail generation
- **georaster-layer-for-leaflet 3.10.0**: Advanced tile-based rendering
- **proj4 2.19.10**: Coordinate system transformation (UTM to WGS84)
- **GDAL.js 2.2.0**: WebAssembly geospatial processing

### Backend & Cloud (Enterprise)
- **Node.js/Express**: API server for file processing
- **PostgreSQL**: Metadata and job tracking
- **Redis**: Job queues and tile caching  
- **Cloud Storage**: AWS S3, Google Cloud, Azure
- **CDN**: Global tile delivery and caching

### State & Performance
- **Zustand 4.4.7**: State management with devtools and persistence
- **Web Vitals 4.2.3**: Performance monitoring with local reporting
- **Immer 10.0.3**: Immutable state updates
- **Client-side optimization**: Hydration handling and CSP compliance

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   ├── map/              # Leaflet-specific components
│   ├── layout/           # Layout components
│   ├── upload/           # File handling
│   └── sharing/          # Export and embedding
├── lib/                   # Utility functions
└── types/                 # TypeScript definitions

docs/                      # Documentation (planned)
prd/                       # Product Requirements
├── geotiff-viewer-prd.md # Detailed requirements
CLAUDE.md                  # Development guidelines
PLAN.md                    # Comprehensive development plan
security-report.md         # Security audit
```

## 🏃‍♂️ Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript validation

# shadcn/ui Components
npx shadcn-ui@latest add [component-name]

# CCPlugins Commands (if installed)
/session-start       # Initialize development session
/implement           # Structured feature development
/review              # Code quality review
/security-scan       # Security analysis
/docs                # Documentation management
```

## 🎨 Design System

Built with **shadcn/ui** components following modern design principles:

- **Responsive First**: Mobile-friendly design patterns
- **Accessibility**: WCAG 2.1 AA compliance
- **Dark Mode**: Theme switching support
- **Consistent**: Design tokens and spacing system
- **Performant**: Optimized for large dataset visualization

## 🔒 Security

Security is a top priority with comprehensive measures:

- **File Upload Validation**: Magic number checking, size limits, virus scanning
- **SSRF Prevention**: URL allowlisting and request validation
- **XSS Protection**: Input sanitization and CSP headers
- **WebAssembly Safety**: Sandboxed processing environment
- **Cloud Security**: Proper IAM and encryption for storage integrations

See [security-report.md](./security-report.md) for detailed security analysis.

## 📈 Performance Targets

| Metric | MVP Target | Enterprise Target | Strategy |
|--------|------------|-------------------|----------|
| Initial Load | < 3s | < 10s | Code splitting + server-side tile generation |
| Pan/Zoom | 60fps | 60fps | Tile-based rendering + GPU acceleration |
| File Size Support | 1GB | 50GB+ | Server-side GDAL + chunked upload + COG |
| Bundle Size | < 500KB | < 500KB | Strategic imports + tree shaking |
| Concurrent Layers | 2-4 | 4-8 | Intelligent tile caching + server compositing |
| Memory Usage | < 500MB | < 2GB browser | LRU tile cache + server processing |
| Upload Speed | N/A | Resumable | Chunked upload with pause/resume |
| Tile Serving | N/A | < 200ms | CDN delivery + smart caching |

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](./CONTRIBUTING.md) for details on:

- Development setup and workflow
- Code style and conventions  
- Testing requirements
- Pull request process
- Issue reporting

### Quick Contribution Setup

```bash
# Fork and clone the repository
git clone https://github.com/your-username/leaflet-viewer.git

# Create feature branch
git checkout -b feature/your-feature-name

# Install dependencies and start development
npm install
npm run dev

# Run tests and linting
npm test
npm run lint
```

## 📚 Documentation

### Core Documentation
- **[PLAN.md](./PLAN.md)**: Comprehensive development plan with enterprise architecture
- **[CLAUDE.md](./CLAUDE.md)**: Project guidelines and current implementation status
- **[CHANGELOG.md](./CHANGELOG.md)**: Complete version history and feature implementation
- **[PRD](./prd/geotiff-viewer-prd.md)**: Product Requirements Document
- **[Security Report](./security-report.md)**: Security analysis and mitigation strategies

### Technical Documentation
- **[COORDINATE-SYSTEMS.md](./COORDINATE-SYSTEMS.md)**: Coordinate transformation and projection support
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)**: Common issues and solutions
- **[CLOUD-SETUP.md](./CLOUD-SETUP.md)**: Cloud infrastructure deployment guide (planned)
- **[LARGE-FILES.md](./LARGE-FILES.md)**: Guide for handling 50GB+ GeoTIFF files (planned)
- **[API.md](./API.md)**: Backend API documentation for enterprise features (planned)
- **[PERFORMANCE.md](./PERFORMANCE.md)**: Enterprise optimization strategies (planned)

## 🔗 Useful Links

- **[Next.js Documentation](https://nextjs.org/docs)**: Framework documentation
- **[Leaflet.js Guide](https://leafletjs.com/)**: Mapping library documentation
- **[shadcn/ui Components](https://ui.shadcn.com/)**: UI component library
- **[Tailwind CSS](https://tailwindcss.com/)**: Styling framework
- **[CCPlugins](https://github.com/brennercruvinel/CCPlugins)**: Professional Claude Code commands

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

- **Issues**: [GitHub Issues](https://github.com/your-org/leaflet-viewer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/leaflet-viewer/discussions)
- **Email**: your-email@example.com

---

**Built with ❤️ for the geospatial community**

*Transforming complex spatial data into compelling visual stories that drive decision-making and client engagement.*