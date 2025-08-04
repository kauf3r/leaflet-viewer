# Cloud Infrastructure Setup Guide

## Overview
This guide covers setting up the cloud infrastructure required to handle large GeoTIFF files (50GB+) in the Leaflet Viewer application.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Next.js App)                    │
├─────────────────────────────────────────────────────────────┤
│                      LOAD BALANCER                         │
├─────────────────────────────────────────────────────────────┤
│  API SERVER (Node.js)  │  PROCESSING WORKERS (GDAL)       │
├─────────────────────────────────────────────────────────────┤
│     REDIS QUEUE        │     POSTGRESQL METADATA          │
├─────────────────────────────────────────────────────────────┤
│              CLOUD STORAGE (S3/GCS/Azure)                  │
├─────────────────────────────────────────────────────────────┤
│                   CDN (CloudFlare/AWS)                     │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

### Required Services
- **Cloud Storage**: AWS S3, Google Cloud Storage, or Azure Blob Storage
- **Database**: PostgreSQL 15+ (managed service recommended)
- **Cache/Queue**: Redis 7+ (managed service recommended)
- **CDN**: CloudFlare, AWS CloudFront, or Google Cloud CDN
- **Compute**: Container orchestration (Kubernetes, Docker Swarm, or managed services)

### Required Software
- **Docker**: For containerization
- **GDAL**: Version 3.7+ with Python bindings
- **Node.js**: Version 18+ for API server
- **Kubernetes CLI**: For orchestration (optional)

## Setup Options

### Option 1: AWS Infrastructure

#### 1.1 Core Services Setup
```bash
# Create S3 bucket for file storage
aws s3 mb s3://your-geotiff-bucket --region us-west-2

# Create S3 bucket for tiles
aws s3 mb s3://your-tiles-bucket --region us-west-2

# Set up S3 lifecycle policies for cost optimization
aws s3api put-bucket-lifecycle-configuration \
  --bucket your-geotiff-bucket \
  --lifecycle-configuration file://s3-lifecycle.json
```

#### 1.2 Database Setup (RDS PostgreSQL)
```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier geotiff-metadata \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 15.4 \
  --allocated-storage 100 \
  --storage-type gp2 \
  --master-username admin \
  --master-user-password YourSecurePassword \
  --vpc-security-group-ids sg-xxxxxxxxx
```

#### 1.3 Redis Setup (ElastiCache)
```bash
# Create Redis cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id geotiff-queue \
  --engine redis \
  --cache-node-type cache.t3.micro \
  --num-cache-nodes 1
```

#### 1.4 ECS/EKS Setup for Processing
```yaml
# ecs-task-definition.json
{
  "family": "geotiff-processor",
  "taskRoleArn": "arn:aws:iam::account:role/ecsTaskRole",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "2048",
  "memory": "8192",
  "containerDefinitions": [
    {
      "name": "geotiff-processor",
      "image": "your-account.dkr.ecr.region.amazonaws.com/geotiff-processor:latest",
      "environment": [
        {"name": "REDIS_URL", "value": "redis://your-redis-endpoint:6379"},
        {"name": "DATABASE_URL", "value": "postgresql://username:password@host:5432/database"},
        {"name": "S3_BUCKET", "value": "your-geotiff-bucket"}
      ]
    }
  ]
}
```

### Option 2: Google Cloud Platform

#### 2.1 Core Services Setup
```bash
# Create Cloud Storage buckets
gsutil mb -l us-west1 gs://your-geotiff-bucket
gsutil mb -l us-west1 gs://your-tiles-bucket

# Set up bucket lifecycle management
gsutil lifecycle set lifecycle.json gs://your-geotiff-bucket
```

#### 2.2 Cloud SQL PostgreSQL
```bash
# Create Cloud SQL instance
gcloud sql instances create geotiff-metadata \
  --database-version=POSTGRES_15 \
  --tier=db-custom-2-8192 \
  --region=us-west1 \
  --storage-size=100GB \
  --storage-type=SSD
```

#### 2.3 Cloud Memorystore Redis
```bash
# Create Redis instance
gcloud redis instances create geotiff-queue \
  --size=1 \
  --region=us-west1 \
  --redis-version=redis_7_0
```

#### 2.4 GKE Setup
```yaml
# kubernetes-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: geotiff-processor
spec:
  replicas: 3
  selector:
    matchLabels:
      app: geotiff-processor
  template:
    metadata:
      labels:
        app: geotiff-processor
    spec:
      containers:
      - name: processor
        image: gcr.io/your-project/geotiff-processor:latest
        resources:
          requests:
            memory: "4Gi"
            cpu: "1000m"
          limits:
            memory: "8Gi"
            cpu: "2000m"
        env:
        - name: REDIS_URL
          value: "redis://your-redis-ip:6379"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: url
```

### Option 3: Azure Infrastructure

#### 3.1 Storage Account Setup
```bash
# Create storage account
az storage account create \
  --name yourgeotiffstorage \
  --resource-group your-resource-group \
  --location westus2 \
  --sku Standard_LRS

# Create containers
az storage container create \
  --name geotiff-files \
  --account-name yourgeotiffstorage

az storage container create \
  --name tiles \
  --account-name yourgeotiffstorage
```

#### 3.2 Azure Database for PostgreSQL
```bash
# Create PostgreSQL server
az postgres server create \
  --resource-group your-resource-group \
  --name geotiff-metadata \
  --location westus2 \
  --admin-user admin \
  --admin-password YourSecurePassword \
  --sku-name GP_Gen5_2
```

#### 3.3 Azure Cache for Redis
```bash
# Create Redis cache
az redis create \
  --location westus2 \
  --name geotiff-queue \
  --resource-group your-resource-group \
  --sku Basic \
  --vm-size c0
```

## Environment Configuration

### Required Environment Variables
```bash
# Cloud Storage
CLOUD_STORAGE_PROVIDER=aws|gcp|azure
AWS_S3_BUCKET=your-geotiff-bucket
AWS_S3_TILES_BUCKET=your-tiles-bucket
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Database
DATABASE_URL=postgresql://username:password@host:5432/database
DATABASE_POOL_SIZE=20

# Redis
REDIS_URL=redis://host:6379
REDIS_POOL_SIZE=10

# Processing
MAX_FILE_SIZE_GB=50
PROCESSING_WORKERS=4
GDAL_DATA=/usr/share/gdal
GDAL_CACHEMAX=2048

# CDN
CDN_BASE_URL=https://your-cdn-domain.com
TILE_CACHE_TTL=86400

# API
API_BASE_URL=https://api.your-domain.com
UPLOAD_CHUNK_SIZE=104857600  # 100MB chunks
```

## Security Configuration

### 1. IAM Policies (AWS Example)
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::your-geotiff-bucket/*",
        "arn:aws:s3:::your-tiles-bucket/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-geotiff-bucket",
        "arn:aws:s3:::your-tiles-bucket"
      ]
    }
  ]
}
```

### 2. Network Security
```bash
# Security group for API servers
aws ec2 create-security-group \
  --group-name geotiff-api \
  --description "GeoTIFF API servers"

# Allow HTTPS from anywhere
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxxx \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0

# Allow internal communication
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxxx \
  --protocol tcp \
  --port 5432 \
  --source-group sg-xxxxxxxxx
```

### 3. SSL/TLS Configuration
```bash
# Get SSL certificate (Let's Encrypt)
certbot certonly --webroot \
  -w /var/www/html \
  -d api.your-domain.com \
  -d tiles.your-domain.com
```

## Monitoring & Logging

### 1. CloudWatch/Stackdriver Setup
```bash
# AWS CloudWatch log group
aws logs create-log-group --log-group-name /aws/ecs/geotiff-processor

# Set retention policy
aws logs put-retention-policy \
  --log-group-name /aws/ecs/geotiff-processor \
  --retention-in-days 30
```

### 2. Metrics & Alerts
```yaml
# CloudWatch alarms
ProcessingQueueAlarm:
  Type: AWS::CloudWatch::Alarm
  Properties:
    AlarmName: "High Processing Queue"
    ComparisonOperator: GreaterThanThreshold
    EvaluationPeriods: 2
    MetricName: ApproximateNumberOfMessages
    Namespace: AWS/SQS
    Period: 300
    Statistic: Average
    Threshold: 100
```

## Deployment Scripts

### Docker Compose for Development
```yaml
version: '3.8'
services:
  api:
    build: ./api
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/geotiff
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  processor:
    build: ./processor
    environment:
      - REDIS_URL=redis://redis:6379
      - DATABASE_URL=postgresql://postgres:password@db:5432/geotiff
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=geotiff
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

### Production Deployment
```bash
#!/bin/bash
# production-deploy.sh

# Build and push images
docker build -t your-registry/geotiff-api:latest ./api
docker build -t your-registry/geotiff-processor:latest ./processor

docker push your-registry/geotiff-api:latest
docker push your-registry/geotiff-processor:latest

# Deploy to Kubernetes
kubectl apply -f k8s/
kubectl rollout status deployment/geotiff-api
kubectl rollout status deployment/geotiff-processor

# Update CDN cache
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone-id}/purge_cache" \
  -H "Authorization: Bearer {api-token}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

## Cost Optimization

### 1. Storage Lifecycle Management
```json
{
  "Rules": [
    {
      "ID": "GeoTIFFLifecycle",
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "STANDARD_IA"
        },
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        },
        {
          "Days": 365,
          "StorageClass": "DEEP_ARCHIVE"
        }
      ]
    }
  ]
}
```

### 2. Auto-scaling Configuration
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: geotiff-processor-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: geotiff-processor
  minReplicas: 1
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## Troubleshooting

### Common Issues
1. **Large file upload timeouts**: Increase load balancer and API timeouts
2. **Processing failures**: Check GDAL installation and memory limits
3. **Tile serving slow**: Verify CDN configuration and cache headers
4. **Database connection issues**: Check connection pool settings and network security groups

### Monitoring Commands
```bash
# Check processing queue
redis-cli -h your-redis-host LLEN processing_queue

# Monitor database connections
psql -h your-db-host -c "SELECT count(*) FROM pg_stat_activity;"

# Check storage usage
aws s3 ls s3://your-bucket --recursive --summarize

# Monitor API performance
curl -w "@curl-format.txt" -o /dev/null -s "https://api.your-domain.com/health"
```

---

**Next Steps**: Once cloud infrastructure is set up, proceed to implement the chunked upload system and server-side processing pipeline as outlined in the main development plan.