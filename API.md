# GeoTIFF Viewer API Documentation

## Overview
This document describes the REST API for the GeoTIFF Viewer backend, which handles large file processing, tile serving, and metadata management.

## Base URL
```
Production: https://api.geotiff-viewer.com/v1
Development: http://localhost:3001/v1
```

## Authentication
Currently using API key authentication. Include in header:
```
Authorization: Bearer YOUR_API_KEY
```

## API Endpoints

### File Management

#### Upload File (Chunked)
```http
POST /files/upload/initialize
```

Initialize a chunked upload for large files.

**Request Body:**
```json
{
  "filename": "large-orthophoto.tif",
  "size": 53297561600,
  "chunk_size": 104857600,
  "checksum": "sha256:abcdef123456...",
  "metadata": {
    "type": "orthophoto",
    "capture_date": "2023-08-15",
    "resolution": 0.1
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "upload_id": "uuid-v4",
    "chunk_count": 507,
    "upload_urls": [
      "https://storage.com/upload/chunk-0",
      "https://storage.com/upload/chunk-1"
    ],
    "expires_at": "2023-08-15T18:00:00Z"
  }
}
```

#### Upload File Chunk
```http
PUT /files/upload/{upload_id}/chunks/{chunk_number}
```

Upload a single chunk of the file.

**Headers:**
```
Content-Type: application/octet-stream
Content-Length: 104857600
Content-MD5: d41d8cd98f00b204e9800998ecf8427e
```

**Response:**
```json
{
  "success": true,
  "data": {
    "chunk_number": 0,
    "checksum": "md5:d41d8cd98f00b204e9800998ecf8427e",
    "uploaded_at": "2023-08-15T12:00:00Z"
  }
}
```

#### Complete Upload
```http
POST /files/upload/{upload_id}/complete
```

Signal that all chunks have been uploaded and trigger processing.

**Request Body:**
```json
{
  "chunks": [
    {
      "number": 0,
      "checksum": "md5:d41d8cd98f00b204e9800998ecf8427e"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "file_id": "uuid-v4",
    "status": "processing",
    "processing_job_id": "job-uuid"
  }
}
```

#### Get File Status
```http
GET /files/{file_id}/status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "file_id": "uuid-v4",
    "status": "processing",
    "stage": "tile_generation",
    "progress": 65,
    "message": "Generating tiles for zoom level 12",
    "estimated_time_remaining": 180,
    "created_at": "2023-08-15T12:00:00Z",
    "started_processing_at": "2023-08-15T12:15:00Z",
    "tiles_generated": 8500,
    "total_tiles": 13000
  }
}
```

#### Get File Metadata
```http
GET /files/{file_id}/metadata
```

**Response:**
```json
{
  "success": true,
  "data": {
    "file_id": "uuid-v4",
    "original_filename": "large-orthophoto.tif",
    "size": 53297561600,
    "processed_size": 25648780800,
    "format": "GeoTIFF",
    "dimensions": {
      "width": 50000,
      "height": 40000,
      "bands": 3
    },
    "geospatial": {
      "projection": "EPSG:4326",
      "bounds": {
        "north": 45.123456,
        "south": 44.123456,
        "east": -122.123456,
        "west": -123.123456
      },
      "resolution": [0.0001, 0.0001],
      "center": [-122.623456, 44.623456]
    },
    "processing": {
      "cog_optimized": true,
      "compression": "LZW",
      "tile_count": 13000,
      "pyramid_levels": 8,
      "processing_time_seconds": 1200
    },
    "created_at": "2023-08-15T12:00:00Z",
    "processed_at": "2023-08-15T12:35:00Z"
  }
}
```

### Tile Serving

#### Get Tile
```http
GET /files/{file_id}/tiles/{z}/{x}/{y}.png
```

Serve a map tile for the specified zoom level and coordinates.

**Parameters:**
- `z`: Zoom level (0-18)
- `x`: Tile X coordinate
- `y`: Tile Y coordinate

**Query Parameters:**
- `format`: Tile format (`png`, `jpg`, `webp`)
- `quality`: JPEG quality (1-100, default: 85)
- `band`: Band selection for multi-band images

**Response:**
```
Content-Type: image/png
Cache-Control: public, max-age=31536000
Content-Length: 15420

[Binary image data]
```

#### Get Tile Metadata
```http
GET /files/{file_id}/tiles/{z}/{x}/{y}/metadata
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tile_id": "uuid-v4",
    "zoom_level": 12,
    "tile_x": 1234,
    "tile_y": 5678,
    "bounds": {
      "north": 45.123456,
      "south": 45.113456,
      "east": -122.113456,
      "west": -122.123456
    },
    "file_size": 15420,
    "format": "PNG",
    "generated_at": "2023-08-15T12:30:00Z",
    "cache_url": "https://cdn.example.com/tiles/uuid-v4/12/1234/5678.png"
  }
}
```

### Processing Jobs

#### Get Job Status
```http
GET /jobs/{job_id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "job_id": "job-uuid",
    "type": "geotiff_processing",
    "status": "running",
    "progress": 65,
    "stage": "tile_generation",
    "message": "Generating tiles for zoom level 12",
    "started_at": "2023-08-15T12:15:00Z",
    "estimated_completion": "2023-08-15T12:45:00Z",
    "worker_id": "worker-1",
    "memory_usage": "8.5GB",
    "cpu_usage": "85%"
  }
}
```

#### Cancel Job
```http
DELETE /jobs/{job_id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "job_id": "job-uuid",
    "status": "cancelled",
    "cancelled_at": "2023-08-15T12:25:00Z"
  }
}
```

### Analysis & Statistics

#### Get File Statistics
```http
GET /files/{file_id}/statistics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "file_id": "uuid-v4",
    "bands": [
      {
        "band_number": 1,
        "data_type": "UInt16",
        "min_value": 0,
        "max_value": 65535,
        "mean": 12845.6,
        "stddev": 8932.1,
        "no_data_value": 0,
        "histogram": {
          "bins": [0, 100, 200, 300],
          "counts": [1234, 5678, 9012, 3456]
        }
      }
    ],
    "overall": {
      "valid_pixels": 1999500000,
      "no_data_pixels": 500000,
      "total_pixels": 2000000000
    }
  }
}
```

#### Get Tile Usage Statistics
```http
GET /files/{file_id}/tiles/usage
```

**Response:**
```json
{
  "success": true,
  "data": {
    "file_id": "uuid-v4",
    "total_tiles": 13000,
    "tiles_accessed": 8500,
    "cache_hit_rate": 0.85,
    "total_requests": 45000,
    "bandwidth_used": "12.5GB",
    "popular_zoom_levels": [
      {"zoom": 12, "requests": 15000},
      {"zoom": 13, "requests": 12000},
      {"zoom": 11, "requests": 8000}
    ],
    "geographic_hotspots": [
      {
        "bounds": {
          "north": 45.123456,
          "south": 45.113456,
          "east": -122.113456,
          "west": -122.123456
        },
        "requests": 5000
      }
    ]
  }
}
```

### System Health

#### Health Check
```http
GET /health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2023-08-15T12:00:00Z",
    "version": "1.2.3",
    "uptime": 86400,
    "services": {
      "database": "healthy",
      "redis": "healthy",
      "storage": "healthy",
      "processing_queue": "healthy"
    },
    "metrics": {
      "active_jobs": 3,
      "queue_length": 12,
      "memory_usage": "16.5GB",
      "cpu_usage": "45%",
      "disk_usage": "67%"
    }
  }
}
```

#### System Metrics
```http
GET /metrics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "processing": {
      "total_files_processed": 1542,
      "total_processing_time": 156780,
      "average_processing_time": 101.7,
      "files_processing": 3,
      "queue_length": 12
    },
    "storage": {
      "total_files": 1542,
      "total_size": "15.6TB",
      "total_tiles": 19500000,
      "cache_size": "2.1TB",
      "cache_hit_rate": 0.82
    },
    "performance": {
      "average_tile_response_time": 45,
      "p95_tile_response_time": 120,
      "requests_per_second": 1250,
      "bandwidth_usage": "850Mbps"
    }
  }
}
```

## WebSocket API

### Real-time Updates
```javascript
// Connect to WebSocket
const ws = new WebSocket('wss://api.geotiff-viewer.com/v1/ws');

// Subscribe to job updates
ws.send(JSON.stringify({
  type: 'subscribe',
  topic: 'job_updates',
  job_id: 'job-uuid'
}));

// Receive updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Job update:', data);
};
```

**Update Message Format:**
```json
{
  "type": "job_update",
  "job_id": "job-uuid",
  "status": "running",
  "progress": 75,
  "message": "Generating overview pyramids",
  "timestamp": "2023-08-15T12:30:00Z"
}
```

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "PROCESSING_FAILED",
    "message": "Failed to process GeoTIFF file",
    "details": "Invalid projection information",
    "timestamp": "2023-08-15T12:00:00Z",
    "request_id": "req-uuid"
  }
}
```

### Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `INVALID_REQUEST` | Malformed request body | 400 |
| `UNAUTHORIZED` | Invalid or missing API key | 401 |
| `FILE_TOO_LARGE` | File exceeds size limit | 413 |
| `UNSUPPORTED_FORMAT` | File format not supported | 415 |
| `PROCESSING_FAILED` | Server processing error | 500 |
| `STORAGE_ERROR` | Cloud storage error | 502 |
| `QUEUE_FULL` | Processing queue at capacity | 503 |
| `RATE_LIMITED` | Too many requests | 429 |

## Rate Limits

| Endpoint Type | Limit | Window |
|---------------|-------|---------|
| File Upload | 10 uploads | 1 hour |
| Tile Requests | 10,000 requests | 1 minute |
| API Calls | 1,000 requests | 1 minute |
| WebSocket Connections | 50 connections | Per API key |

## SDKs & Examples

### JavaScript/TypeScript SDK
```typescript
import { GeoTIFFViewerAPI } from '@geotiff-viewer/api-client';

const api = new GeoTIFFViewerAPI({
  baseUrl: 'https://api.geotiff-viewer.com/v1',
  apiKey: 'your-api-key'
});

// Upload large file
const upload = await api.files.uploadLarge(file, {
  onProgress: (progress) => console.log(`Progress: ${progress}%`),
  onChunkComplete: (chunk) => console.log(`Chunk ${chunk} complete`)
});

// Get file status
const status = await api.files.getStatus(upload.fileId);

// Load tiles
const tileUrl = api.tiles.getTileUrl(fileId, z, x, y);
```

### Python SDK
```python
from geotiff_viewer import GeoTIFFViewerAPI

api = GeoTIFFViewerAPI(
    base_url='https://api.geotiff-viewer.com/v1',
    api_key='your-api-key'
)

# Upload file
upload = api.files.upload_large(
    file_path='large-orthophoto.tif',
    chunk_size=100 * 1024 * 1024  # 100MB chunks
)

# Monitor processing
for status in api.jobs.watch(upload['processing_job_id']):
    print(f"Progress: {status['progress']}%")
    if status['status'] == 'complete':
        break
```

### cURL Examples
```bash
# Initialize upload
curl -X POST https://api.geotiff-viewer.com/v1/files/upload/initialize \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "large-orthophoto.tif",
    "size": 53297561600,
    "chunk_size": 104857600
  }'

# Upload chunk
curl -X PUT https://api.geotiff-viewer.com/v1/files/upload/UPLOAD_ID/chunks/0 \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/octet-stream" \
  -H "Content-MD5: d41d8cd98f00b204e9800998ecf8427e" \
  --data-binary @chunk-0.bin

# Get tile
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.geotiff-viewer.com/v1/files/FILE_ID/tiles/12/1234/5678.png \
  --output tile.png
```

## Changelog

### v1.2.3 (2023-08-15)
- Added support for 50GB+ files
- Improved chunked upload reliability
- Added WebSocket real-time updates
- Enhanced tile caching

### v1.2.2 (2023-08-01)
- Added tile usage statistics
- Improved error handling
- Performance optimizations

### v1.2.1 (2023-07-15)
- Added WebP tile format support
- Improved processing queue management
- Bug fixes for large file handling

---

For more information and support, visit our [documentation](https://docs.geotiff-viewer.com) or contact [support@geotiff-viewer.com](mailto:support@geotiff-viewer.com).