#!/bin/bash

# ===========================================
# LocalStack S3 Bucket Initialization
# ===========================================

echo "Initializing LocalStack S3 buckets..."

# Wait for LocalStack to be ready
sleep 5

# Create development S3 bucket
awslocal s3 mb s3://geotiff-dev-bucket

# Set bucket policy for development
awslocal s3api put-bucket-policy --bucket geotiff-dev-bucket --policy '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicRead",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::geotiff-dev-bucket/tiles/*"
    }
  ]
}'

# Enable CORS for bucket
awslocal s3api put-bucket-cors --bucket geotiff-dev-bucket --cors-configuration '{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "POST", "PUT", "DELETE", "HEAD"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3600
    }
  ]
}'

echo "S3 bucket initialization complete!"
echo "Bucket: s3://geotiff-dev-bucket"
echo "Access via: http://localhost:4566"