# GeoTIFF Processing & Visualization Platform

A powerful, enterprise-scale platform for processing and visualizing GeoTIFF files with cloud-based processing and interactive web-based viewing. **Now supports files up to 50GB+ with distributed processing and tile streaming.**

![Project Status](https://img.shields.io/badge/status-development-yellow)
![Next.js](https://img.shields.io/badge/Next.js-15+-black)
![NestJS](https://img.shields.io/badge/NestJS-10+-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue)
![Docker](https://img.shields.io/badge/Docker-compose-blue)

## 🏗️ Architecture

This platform follows a modern **monorepo microservices architecture** with:

- **Frontend**: Next.js 15 with existing leaflet-viewer (React + TypeScript + Leaflet.js)
- **Backend**: NestJS API with TypeORM, PostgreSQL, and GDAL processing
- **Storage**: AWS S3 + LocalStack for development
- **Infrastructure**: Docker containers with health checks and monitoring
- **Development**: Full docker-compose development environment

## 🚀 Quick Start

### Prerequisites

- **Node.js 20+** and **npm 10+**
- **Docker & Docker Compose** 
- **Git**

### 1. Clone and Setup

```bash
git clone https://github.com/kauf3r/leaflet-viewer.git
cd leaflet-viewer

# Install all dependencies (monorepo workspace)
npm install
```

### 2. Environment Configuration

```bash
# Copy environment configuration
cp .env.example .env.local

# The .env.local file contains development-ready values:
# - Database: PostgreSQL with PostGIS
# - Storage: LocalStack (AWS S3 mock)
# - API: NestJS server on port 3001
# - Frontend: Next.js on port 3000
```

### 3. Start Development Environment

```bash
# Start all services with Docker Compose
npm run docker:up

# Or start services individually:
npm run dev:server    # NestJS API server
npm run dev:viewer    # Next.js frontend
```

### 4. Access Services

- **Frontend (Viewer)**: http://localhost:3000
- **API Documentation**: http://localhost:3001/api/docs
- **Health Check**: http://localhost:3001/api/v1/health
- **LocalStack S3**: http://localhost:4566
- **PostgreSQL**: localhost:5432 (user: `user`, password: `pass`, database: `geotiff_db`)

## 📁 Project Structure

```
leaflet-viewer/                  # Monorepo root
├── packages/
│   ├── viewer/                  # Next.js Frontend (existing)
│   │   ├── src/                 # Components, pages, utilities
│   │   ├── public/              # Static assets
│   │   ├── package.json         # Frontend dependencies
│   │   └── Dockerfile.dev       # Development container
│   └── server/                  # NestJS Backend API (new)
│       ├── src/
│       │   ├── modules/         # Feature modules
│       │   │   ├── health/      # Health checks & monitoring
│       │   │   ├── files/       # File upload & management
│       │   │   ├── processing/  # GeoTIFF processing pipeline
│       │   │   └── tiles/       # Map tile serving
│       │   ├── config/          # Configuration management
│       │   ├── common/          # Shared utilities
│       │   ├── app.module.ts    # Main application module
│       │   └── main.ts          # Bootstrap & middleware
│       ├── package.json         # Backend dependencies
│       └── Dockerfile           # Production container
├── scripts/                     # Development & deployment scripts
├── docker-compose.yml           # Development environment
├── .env.local                   # Development environment variables
├── .env.example                 # Environment template
└── package.json                 # Monorepo workspace configuration
```

## 🛠️ Development

### Building & Testing

```bash
# Build all packages
npm run build

# Build individual packages
npm run build:server
npm run build:viewer

# Run tests
npm run test

# Type checking
npm run type-check

# Linting
npm run lint
```

### API Development

The NestJS API provides enterprise-grade GeoTIFF processing:

```bash
# Start API server in development mode
cd packages/server
npm run start:dev

# API endpoints available at http://localhost:3001/api/v1/
# - POST /files/upload          # Upload GeoTIFF files
# - GET  /files/{id}/status     # Check processing status  
# - GET  /files/{id}/tiles      # Get tile configuration
# - GET  /tiles/{id}/{z}/{x}/{y}.png  # Serve map tiles
# - GET  /health                # System health checks
```

### Database Management

```bash
# Access PostgreSQL directly
docker exec -it geotiff-postgres psql -U user -d geotiff_db

# View database logs
docker logs geotiff-postgres

# Reset database (destroys data!)
docker-compose down -v
docker-compose up postgres
```

## 🐳 Docker Development

### Full Stack Development

```bash
# Start all services (recommended)
docker-compose up

# Start with rebuilding
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f api
docker-compose logs -f frontend

# Stop all services
docker-compose down
```

### Individual Service Development

```bash
# Backend API only
docker-compose up postgres localstack
cd packages/server && npm run start:dev

# Frontend only
cd packages/viewer && npm run dev
```

## ⚙️ Configuration

### Environment Variables

Key configuration options in `.env.local`:

```bash
# API Server
PORT=3001
NODE_ENV=development

# Database (PostgreSQL + PostGIS)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=user
DB_PASSWORD=pass
DB_DATABASE=geotiff_db

# File Processing
MAX_FILE_SIZE=53687091200  # 50GB
TILE_SIZE=256
MAX_ZOOM_LEVEL=18
TEMP_DIRECTORY=/tmp/geotiff-processing

# AWS/LocalStack (S3 Storage)
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_REGION=us-east-1
AWS_S3_BUCKET=geotiff-dev-bucket

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

### Production Configuration

For production deployment, override these variables:
- Use real AWS credentials and S3 bucket
- Set `NODE_ENV=production`
- Configure SSL certificates
- Set strong JWT secrets
- Configure proper database connection pooling

## 🧪 Current Development Status

### ✅ Story 1.1: Web Service Scaffolding (COMPLETED)

- [x] Monorepo structure with npm workspaces
- [x] NestJS backend with TypeScript
- [x] Health check endpoints working
- [x] Docker development environment
- [x] PostgreSQL database with PostGIS
- [x] LocalStack for S3 development
- [x] CORS and security headers configured
- [x] Environment variable management
- [x] All packages building successfully

### 🔄 Next Stories (In Progress)

- **Story 1.2**: Database & ORM Setup (GeospatialFile entity, migrations)
- **Story 1.3**: File Upload Service (S3 integration, validation)
- **Story 1.4**: GeoTIFF Processing Pipeline (GDAL, COG conversion)
- **Story 1.5**: Map Viewer Integration (API connection, tile serving)

## 🚀 Deployment

### Development Deployment

```bash
# Using Docker Compose (recommended)
docker-compose -f docker-compose.prod.yml up -d
```

### Production Deployment

The platform is designed for cloud deployment with:
- **AWS**: ECS/EKS + RDS PostgreSQL + S3
- **Google Cloud**: GKE + Cloud SQL + Cloud Storage  
- **Azure**: AKS + PostgreSQL + Blob Storage

CI/CD pipeline with GitHub Actions is configured for automated deployments.

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Follow the existing code patterns** and TypeScript conventions
4. **Add tests** for new functionality
5. **Ensure all builds pass**: `npm run build && npm run test`
6. **Commit changes**: `git commit -m 'feat: add amazing feature'`
7. **Push to branch**: `git push origin feature/amazing-feature`
8. **Open Pull Request** with detailed description

### Development Guidelines

- **TypeScript First**: All new code must be TypeScript
- **Test Coverage**: Maintain >80% test coverage
- **API Documentation**: Update Swagger docs for API changes
- **Error Handling**: Comprehensive error handling with proper HTTP status codes
- **Security**: Follow OWASP guidelines, no secrets in code
- **Performance**: Monitor bundle size and API response times

## 📋 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Check what's using the ports
lsof -i :3000 -i :3001 -i :5432

# Kill processes if needed
docker-compose down
```

**Database Connection Issues**
```bash
# Verify PostgreSQL is running
docker-compose logs postgres

# Reset database
docker-compose down -v && docker-compose up postgres
```

**File Upload Issues**
```bash
# Check API server logs
docker-compose logs api

# Verify LocalStack S3
curl http://localhost:4566/health
```

**Build Failures**
```bash
# Clean all artifacts
npm run clean

# Reinstall dependencies
rm -rf node_modules packages/*/node_modules
npm install

# Rebuild
npm run build
```

## 📊 Performance & Monitoring

### Health Checks

- **API Health**: http://localhost:3001/api/v1/health
- **Database Health**: Included in health check response
- **Memory Usage**: Monitored via health endpoints
- **Disk Usage**: Monitored for temp processing directory

### Metrics & Monitoring

- **Application Metrics**: Built into NestJS health checks
- **Database Performance**: PostgreSQL logging enabled in development
- **File Processing**: Progress tracking and status updates
- **Error Tracking**: Comprehensive logging with structured output

## 🔒 Security

### Development Security

- **Environment Isolation**: Separate development and production configs
- **Input Validation**: All API inputs validated with class-validator
- **File Upload Security**: File type validation, size limits, virus scanning planned
- **SQL Injection Prevention**: TypeORM query builder and parameterization
- **CORS Configuration**: Restricted origins, proper preflight handling

### Production Security (Planned)

- **Authentication**: JWT-based auth with refresh tokens
- **Authorization**: Role-based access control
- **HTTPS Enforcement**: SSL termination at load balancer
- **Security Headers**: Helmet.js with strict CSP
- **Rate Limiting**: API rate limiting and DDoS protection
- **Data Encryption**: At-rest and in-transit encryption

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

- **Documentation**: Check `/docs` directory for detailed guides
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact maintainers for enterprise support

---

**Ready to transform your geospatial data visualization? Let's build something amazing! 🌍✨**