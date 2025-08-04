# CLAUDE.md - Leaflet Viewer Project Guide

## Project Overview
A Next.js application for viewing and interacting with Leaflet maps, with shadcn/ui components for modern UI design.

## Technology Stack
- **Framework**: Next.js 15+ with App Router
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Maps**: Leaflet.js
- **Language**: TypeScript

## Development Commands

### Setup Commands
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Run type checking
npm run type-check
```

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable UI components
└── lib/                   # Utility functions and configurations
```

## Current Project Status

### Initial Setup Complete
- ✅ **Next.js Framework**: App Router configuration
- ✅ **Tailwind CSS**: Styling system configured
- ✅ **shadcn/ui**: Component library setup
- ✅ **TypeScript**: Type safety enabled

### Next Phase Priorities
1. Implement Leaflet map integration
2. Build UI components for map controls
3. Add data visualization features
4. Implement responsive design

## Development Guidelines

### Code Style
- Use TypeScript for all new files
- Follow shadcn/ui component patterns
- Implement responsive design with Tailwind CSS
- Use semantic HTML elements

### Component Architecture
- Create reusable components in `src/components/`
- Use custom hooks for stateful logic
- Implement proper TypeScript types
- Follow shadcn/ui design system

### Testing Strategy
- Unit tests for components
- Integration tests for map functionality
- E2E tests for user flows

## Available Agents

The project includes specialized Claude agents for:
- **frontend-designer**: Next.js and shadcn/ui assistance
- **code-refactorer**: Code improvement and optimization
- **project-task-planner**: Feature planning and breakdown
- **performance-monitor**: Performance optimization
- **security-auditor**: Security best practices
- **test-automation**: Testing implementation

## Common Tasks

### Adding shadcn/ui Components
```bash
npx shadcn-ui@latest add [component-name]
```

### Map Integration
- Use Leaflet.js for map functionality
- Implement proper TypeScript types for map instances
- Handle responsive map sizing

### Styling Guidelines
- Use Tailwind CSS utility classes
- Follow shadcn/ui design tokens
- Implement dark mode support where applicable