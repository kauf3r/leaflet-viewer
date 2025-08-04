# GeoTIFF Showcase Tool

A powerful, web-based visualization tool for showcasing GeoTIFF photogrammetry outputs using Leaflet.js. Built with Next.js and designed for zero backend infrastructure requirements.

![Project Status](https://img.shields.io/badge/status-development-yellow)
![Next.js](https://img.shields.io/badge/Next.js-15+-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)
![Leaflet](https://img.shields.io/badge/Leaflet.js-1.9+-green)

## 🌟 Vision

Transform complex geospatial data into compelling visual stories that drive decision-making, client engagement, and project success through an intuitive, fast, and embeddable web platform.

**The "Figma for Geospatial Data"** - simple, powerful, collaborative.

## ✨ Key Features

### Current (v0.1.0)
- ✅ Next.js 15+ with App Router
- ✅ Tailwind CSS + shadcn/ui components
- ✅ TypeScript for type safety
- ✅ Responsive design foundation
- ✅ Comprehensive development plan

### Planned Implementation

#### Phase 1: MVP Foundation (Weeks 1-2)
- 🔄 **Interactive GeoTIFF Viewer**: Leaflet.js-based map with pan/zoom
- 🔄 **File Upload**: Drag-and-drop interface with validation
- 🔄 **COG Support**: Cloud Optimized GeoTIFF processing
- 🔄 **Basic Sharing**: Shareable links for visualizations

#### Phase 2: Core Features (Weeks 3-4)
- 📋 **Multi-Layer Management**: Support for 2-4 concurrent layers
- 📋 **Comparison Tools**: Side-by-side and swipe comparison modes
- 📋 **Performance Optimization**: Handle 1GB+ files at 60fps
- 📋 **Annotation Tools**: Drawing and measurement capabilities

#### Phase 3: Advanced Features (Weeks 5-6)
- 📋 **Embedding**: Iframe embed code generation
- 📋 **Export Options**: PNG/JPEG image export
- 📋 **Cloud Integration**: S3/GCS/Azure storage support
- 📋 **Advanced Analytics**: NDVI, elevation profiles

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
- Node.js 20.0+ LTS
- Git 2.40.0+
- Modern browser (Chrome 90+, Firefox 88+, Safari 14+)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/leaflet-viewer.git
cd leaflet-viewer

# Install dependencies
npm install

# Initialize shadcn/ui (if not already done)
npx shadcn-ui@latest init

# Run development server
npm run dev
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
- **Leaflet.js 1.9+**: Lightweight, interactive maps
- **GeoTIFF.js 2.0+**: Client-side GeoTIFF parsing
- **GDAL.js 3.7+**: WebAssembly geospatial processing
- **georaster**: Performance-optimized raster operations

### State & Performance
- **Zustand**: Lightweight state management
- **TanStack Query**: Server state and caching
- **Web Workers**: Background processing
- **IndexedDB**: Browser storage for large datasets

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

| Metric | Target | Strategy |
|--------|--------|----------|
| Initial Load | < 3s | Code splitting + lazy loading |
| Pan/Zoom | 60fps | Tile-based rendering + GPU acceleration |
| File Size Support | 1GB+ | Streaming + COG optimization |
| Bundle Size | < 500KB | Strategic imports + tree shaking |
| Concurrent Layers | 2-4 | Smart memory management |
| Memory Usage | < 500MB | LRU caching + garbage collection |

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

- **[PLAN.md](./PLAN.md)**: Comprehensive development plan with architecture and roadmap
- **[CLAUDE.md](./CLAUDE.md)**: Project guidelines and development setup
- **[PRD](./prd/geotiff-viewer-prd.md)**: Product Requirements Document
- **[Security Report](./security-report.md)**: Security analysis and mitigation strategies

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