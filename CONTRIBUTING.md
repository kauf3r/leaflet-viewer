# Contributing to GeoTIFF Showcase Tool

Thank you for your interest in contributing to the GeoTIFF Showcase Tool! This document provides guidelines and information for contributors to help maintain high code quality and ensure smooth collaboration.

## 🌟 Project Vision

We're building **"Figma for Geospatial Data"** - a simple, powerful, collaborative tool that transforms complex geospatial data into compelling visual stories. Every contribution should align with our core values:

- **Accessibility First**: WCAG 2.1 AA compliance and inclusive design
- **Performance First**: Handle 1GB+ files smoothly at 60fps
- **Security First**: Comprehensive security measures from the ground up
- **User Experience First**: Intuitive, responsive, and delightful interactions

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 20.0+ LTS
- **Git**: 2.40.0+
- **Browser**: Chrome 90+, Firefox 88+, or Safari 14+ for development
- **Editor**: VS Code recommended with required extensions (see below)

### Development Environment Setup

```bash
# 1. Fork and clone the repository
git clone https://github.com/your-username/leaflet-viewer.git
cd leaflet-viewer

# 2. Install dependencies
npm install

# 3. Initialize shadcn/ui (if not already done)
npx shadcn-ui@latest init

# 4. Install CCPlugins for enhanced workflow (optional but recommended)
curl -sSL https://raw.githubusercontent.com/brennercruvinel/CCPlugins/main/install.sh | bash

# 5. Verify installation
npm run build      # ✅ Successful build
npm run lint       # ✅ No linting errors  
npm run type-check # ✅ No TypeScript errors

# 6. Start development
npm run dev
```

### Required VS Code Extensions

Install these extensions for the best development experience:

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "dbaeumer.vscode-eslint",
    "formulahendry.auto-rename-tag",
    "ms-vscode.vscode-json"
  ]
}
```

## 📋 Development Workflow

### Branch Naming Convention

```bash
# Feature development
feature/map-controls
feature/geotiff-processor
feature/comparison-tools

# Bug fixes
fix/memory-leak-layer-manager
fix/mobile-touch-events

# Documentation
docs/api-documentation
docs/user-guide

# Performance improvements
perf/tile-loading-optimization
perf/bundle-size-reduction

# Security fixes
security/file-upload-validation
security/xss-prevention
```

### Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```bash
# Format: <type>(<scope>): <description>

# Examples:
feat(map): add multi-layer support with opacity controls
fix(upload): resolve file validation edge cases
docs(readme): update installation instructions
perf(tiles): optimize memory usage for large files
security(upload): add malicious file detection
test(components): add comprehensive map component tests
```

**Types:**
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `security`: Security improvements
- `chore`: Maintenance tasks

### Development Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Use CCPlugins for Professional Workflow** (if installed)
   ```bash
   /session-start          # Initialize development session
   /implement validate     # Structured feature development with validation
   /review                 # Comprehensive code review
   /security-scan          # Security analysis
   /test                   # Run tests
   /docs                   # Update documentation
   ```

3. **Follow TDD Approach**
   ```bash
   # Write tests first
   npm test -- --watch
   
   # Implement feature
   # Ensure tests pass
   
   # Run full test suite
   npm run test:coverage
   ```

4. **Code Quality Checks**
   ```bash
   npm run lint           # ESLint validation
   npm run type-check     # TypeScript validation
   npm run format         # Prettier formatting
   npm test              # Full test suite
   ```

5. **Pre-commit Validation**
   ```bash
   # Automatically runs via husky hooks:
   # - lint-staged for modified files
   # - TypeScript compilation
   # - Test suite for affected components
   ```

## 🏗️ Architecture Guidelines

### Component Structure

Follow the established component architecture:

```
src/components/
├── ui/                     # shadcn/ui base components
├── map/                    # Leaflet-specific components
│   ├── leaflet-map.tsx    # SSR-safe map wrapper
│   ├── geotiff-layer.tsx  # GeoTIFF rendering
│   └── map-controls.tsx   # Zoom, fullscreen controls
├── layout/                 # Layout components
├── upload/                 # File handling
└── sharing/                # Export and embedding
```

### Code Style Guidelines

#### TypeScript Standards

```typescript
// ✅ Good: Explicit types and interfaces
interface GeoTiffLayerProps {
  file: File;
  opacity: number;
  visible: boolean;
  onError: (error: ProcessingError) => void;
}

// ✅ Good: Proper error handling
async function processGeoTiff(file: File): Promise<ProcessedTile[]> {
  try {
    const validator = new FileValidator();
    await validator.validate(file);
    
    return await processTiles(file);
  } catch (error) {
    logger.error('GeoTIFF processing failed', { file: file.name, error });
    throw new ProcessingError('Failed to process GeoTIFF file', { cause: error });
  }
}

// ❌ Bad: Any types and unclear interfaces
function processFile(data: any): any {
  // Implementation
}
```

#### React Component Patterns

```typescript
// ✅ Good: Proper component structure
'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useMapStore } from '@/lib/stores/map-store';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  disabled?: boolean;
}

export function MapControls({ onZoomIn, onZoomOut, disabled = false }: MapControlsProps) {
  const { viewport, setViewport } = useMapStore();
  
  const handleZoomIn = useCallback(() => {
    if (!disabled) {
      onZoomIn();
    }
  }, [onZoomIn, disabled]);

  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-1">
      <Button
        variant="outline"
        size="icon"
        onClick={handleZoomIn}
        disabled={disabled}
        aria-label="Zoom in"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
```

#### State Management

```typescript
// ✅ Good: Zustand store pattern
interface MapStore {
  layers: GeoTiffLayer[];
  viewport: ViewportState;
  addLayer: (layer: GeoTiffLayer) => void;
  removeLayer: (layerId: string) => void;
}

export const useMapStore = create<MapStore>((set, get) => ({
  layers: [],
  viewport: { center: [0, 0], zoom: 2 },
  
  addLayer: (layer) => set((state) => ({
    layers: [...state.layers, layer]
  })),
  
  removeLayer: (layerId) => set((state) => ({
    layers: state.layers.filter(l => l.id !== layerId)
  })),
}));
```

### Performance Guidelines

- **Lazy Loading**: Use dynamic imports for non-critical components
- **Memoization**: Use `useMemo` and `useCallback` for expensive operations
- **Web Workers**: Offload heavy processing (GeoTIFF parsing, tile generation)
- **Memory Management**: Implement cleanup in `useEffect` hooks
- **Bundle Size**: Keep components under 50KB compressed

### Security Guidelines

- **Input Validation**: Validate all user inputs, especially file uploads
- **XSS Prevention**: Sanitize any user-provided content
- **File Upload Security**: Validate file types, scan for malicious content
- **SSRF Prevention**: Whitelist allowed URLs for external requests
- **CSP Compliance**: Ensure all code works with strict Content Security Policy

## 🧪 Testing Standards

### Testing Requirements

| Test Type | Minimum Coverage | Focus Areas |
|-----------|------------------|-------------|
| **Unit Tests** | 80% | Component logic, utility functions |
| **Integration Tests** | 70% | Map functionality, file processing |
| **E2E Tests** | 100% of critical paths | User workflows, accessibility |

### Testing Patterns

```typescript
// ✅ Good: Comprehensive component test
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MapControls } from './map-controls';

describe('MapControls', () => {
  const mockOnZoomIn = jest.fn();
  const mockOnZoomOut = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders zoom controls with proper accessibility', () => {
    render(<MapControls onZoomIn={mockOnZoomIn} onZoomOut={mockOnZoomOut} />);
    
    expect(screen.getByLabelText('Zoom in')).toBeInTheDocument();
    expect(screen.getByLabelText('Zoom out')).toBeInTheDocument();
  });

  it('calls onZoomIn when zoom in button is clicked', async () => {
    render(<MapControls onZoomIn={mockOnZoomIn} onZoomOut={mockOnZoomOut} />);
    
    fireEvent.click(screen.getByLabelText('Zoom in'));
    
    await waitFor(() => {
      expect(mockOnZoomIn).toHaveBeenCalledTimes(1);
    });
  });

  it('disables controls when disabled prop is true', () => {
    render(
      <MapControls 
        onZoomIn={mockOnZoomIn} 
        onZoomOut={mockOnZoomOut} 
        disabled 
      />
    );
    
    expect(screen.getByLabelText('Zoom in')).toBeDisabled();
    expect(screen.getByLabelText('Zoom out')).toBeDisabled();
  });
});
```

### E2E Testing

```typescript
// ✅ Good: Playwright E2E test
import { test, expect } from '@playwright/test';

test.describe('GeoTIFF Upload', () => {
  test('should upload and display GeoTIFF file', async ({ page }) => {
    await page.goto('/');
    
    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('test-data/sample.tif');
    
    // Wait for processing
    await expect(page.locator('[data-testid="processing-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="processing-indicator"]')).toBeHidden({ timeout: 30000 });
    
    // Verify map display
    await expect(page.locator('[data-testid="leaflet-map"]')).toBeVisible();
    await expect(page.locator('.leaflet-layer')).toBeVisible();
    
    // Test accessibility
    await expect(page.locator('[role="application"]')).toBeVisible();
  });
});
```

## 📝 Documentation Standards

### Code Documentation

```typescript
/**
 * Processes a GeoTIFF file and generates optimized tiles for web display
 * 
 * @param file - The GeoTIFF file to process
 * @param options - Processing configuration options
 * @param options.tileSize - Tile size in pixels (default: 256)
 * @param options.compression - Compression level (0-9, default: 6)
 * @returns Promise resolving to processed tile data with metadata
 * 
 * @throws {ValidationError} When file format is invalid or corrupted
 * @throws {ProcessingError} When tile generation fails
 * 
 * @example
 * ```typescript
 * const tiles = await processGeoTiff(file, { 
 *   tileSize: 512, 
 *   compression: 8 
 * });
 * console.log(`Generated ${tiles.length} tiles`);
 * ```
 */
export async function processGeoTiff(
  file: File, 
  options: ProcessingOptions = {}
): Promise<TileData[]>
```

### Component Documentation

```typescript
/**
 * MapControls provides zoom and navigation controls for the Leaflet map
 * 
 * Features:
 * - Keyboard accessible (Tab navigation, Enter/Space activation)
 * - Touch-friendly on mobile devices
 * - Respects reduced motion preferences
 * - Integrates with map state management
 * 
 * @example
 * ```tsx
 * <MapControls
 *   onZoomIn={() => map.zoomIn()}
 *   onZoomOut={() => map.zoomOut()}
 *   disabled={isProcessing}
 * />
 * ```
 */
export function MapControls(props: MapControlsProps) {
  // Implementation
}
```

## 🔍 Code Review Process

### Before Submitting a PR

- [ ] **Functionality**: Feature works as expected and meets requirements
- [ ] **Tests**: All tests pass, new features have adequate test coverage
- [ ] **Performance**: No performance regressions, meets performance targets
- [ ] **Security**: No security vulnerabilities, follows security guidelines
- [ ] **Accessibility**: WCAG 2.1 AA compliant, keyboard navigable
- [ ] **Documentation**: Code is documented, README updated if needed
- [ ] **Code Style**: Follows project conventions, passes linting

### PR Description Template

```markdown
## Description
Brief description of changes and motivation.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Performance Impact
- [ ] Bundle size checked (before/after)
- [ ] Memory usage verified
- [ ] Loading time measured

## Security Checklist
- [ ] Input validation implemented
- [ ] No sensitive data exposure
- [ ] Security scan passed

## Screenshots (if applicable)
Include screenshots for UI changes.

## Additional Notes
Any additional context or notes for reviewers.
```

### Review Criteria

Reviewers will check:

1. **Code Quality**: Clean, readable, maintainable code
2. **Architecture**: Follows established patterns and conventions
3. **Performance**: No regressions, optimal implementation
4. **Security**: Secure coding practices, no vulnerabilities
5. **Testing**: Adequate coverage, quality test cases
6. **Documentation**: Clear, helpful documentation
7. **User Experience**: Intuitive, accessible, responsive

## 🐛 Issue Reporting

### Bug Reports

Use the bug report template:

```markdown
**Describe the Bug**
Clear and concise description of the bug.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
- OS: [e.g. macOS 12.0]
- Browser: [e.g. Chrome 95.0]
- Version: [e.g. 0.2.0]

**Additional Context**
Any other context about the problem.
```

### Feature Requests

Use the feature request template:

```markdown
**Is your feature request related to a problem?**
Clear description of the problem.

**Describe the solution you'd like**
Clear description of what you want to happen.

**Describe alternatives you've considered**
Alternative solutions or features you've considered.

**Additional context**
Any other context, mockups, or screenshots about the feature.
```

## 🎯 Performance Targets

All contributions must maintain these performance standards:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Initial Load | < 3s | Lighthouse, WebPageTest |
| Pan/Zoom | 60fps | Chrome DevTools Performance |
| File Size Support | 1GB+ | Test with large sample files |
| Bundle Size | < 500KB | Bundle analyzer, webpack-bundle-analyzer |
| Memory Usage | < 500MB | Chrome DevTools Memory tab |
| Test Coverage | 80%+ | Jest coverage reports |

## 🔒 Security Requirements

- **File Upload Validation**: Magic number checking, size limits, virus scanning
- **Input Sanitization**: All user inputs must be validated and sanitized
- **XSS Prevention**: Use proper escaping, avoid dangerouslySetInnerHTML
- **SSRF Protection**: Whitelist allowed domains for external requests
- **CSP Compliance**: Code must work with strict Content Security Policy
- **Dependency Security**: Regular security audits with `npm audit`

## 📚 Learning Resources

### Project-Specific
- **[PLAN.md](./PLAN.md)**: Comprehensive development plan and architecture
- **[Security Report](./security-report.md)**: Security analysis and guidelines
- **[CLAUDE.md](./CLAUDE.md)**: Project guidelines and agent assistance

### Technology Stack
- **[Next.js Documentation](https://nextjs.org/docs)**: Framework documentation
- **[Leaflet.js Guide](https://leafletjs.com/)**: Mapping library documentation
- **[shadcn/ui Components](https://ui.shadcn.com/)**: UI component library
- **[Tailwind CSS](https://tailwindcss.com/)**: Styling framework
- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)**: TypeScript documentation

### Best Practices
- **[React Best Practices](https://react.dev/learn)**: Official React documentation
- **[Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)**: WCAG 2.1 reference
- **[Security Best Practices](https://owasp.org/www-project-top-ten/)**: OWASP Top 10
- **[Performance Best Practices](https://web.dev/performance/)**: Web.dev performance guides

## 🤝 Community

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and community discussion
- **Code Reviews**: Collaborative improvement through PR reviews

### Code of Conduct

We are committed to providing a welcoming and inclusive experience for everyone. Please:

- **Be respectful**: Treat everyone with respect and kindness
- **Be inclusive**: Welcome new contributors and diverse perspectives  
- **Be collaborative**: Work together to improve the project
- **Be constructive**: Provide helpful feedback and suggestions
- **Be patient**: Everyone is learning and growing

### Recognition

Contributors will be recognized through:

- **GitHub Contributors**: Automatic recognition in repository
- **CHANGELOG.md**: Major contributions noted in release notes
- **Documentation**: Attribution in relevant documentation

## 🎉 Getting Help

If you need help or have questions:

1. **Check Documentation**: Review PLAN.md, README.md, and other docs
2. **Search Issues**: Look for existing issues and discussions
3. **Ask Questions**: Create a GitHub Discussion for general questions
4. **Report Bugs**: Use GitHub Issues for bug reports
5. **Join Development**: Comment on issues you'd like to work on

---

Thank you for contributing to the GeoTIFF Showcase Tool! Together we're building something amazing for the geospatial community. 🌍✨