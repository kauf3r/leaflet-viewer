import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeospatialFile } from './entities/geospatial-file.entity';
import { ProcessingStatus } from './enums/processing-status.enum';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(GeospatialFile)
    private readonly filesRepository: Repository<GeospatialFile>,
  ) {}

  async uploadFile(file: Express.Multer.File) {
    // Validate file type
    const supportedExtensions = ['.tif', '.tiff', '.gtiff'];
    const fileExtension = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
    
    if (!supportedExtensions.includes(fileExtension)) {
      throw new Error('Unsupported file format. Please upload a GeoTIFF file.');
    }

    // Create database record
    const geospatialFile = this.filesRepository.create({
      id: uuidv4(),
      originalFilename: file.originalname,
      fileSize: file.size,
      status: ProcessingStatus.UPLOADING,
      storagePath: '', // Will be set after upload to S3
      crs: '', // Will be determined during processing
    });

    await this.filesRepository.save(geospatialFile);

    // TODO: Implement actual file upload to S3
    // TODO: Trigger processing pipeline

    return {
      id: geospatialFile.id,
      status: geospatialFile.status,
      message: 'File uploaded successfully and queued for processing',
    };
  }

  async getStatus(id: string) {
    const file = await this.filesRepository.findOne({ where: { id } });
    
    if (!file) {
      throw new NotFoundException('File not found');
    }

    return {
      id: file.id,
      originalFilename: file.originalFilename,
      status: file.status,
      fileSize: file.fileSize,
      crs: file.crs,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
    };
  }

  async getTileConfig(id: string) {
    const file = await this.filesRepository.findOne({ where: { id } });
    
    if (!file) {
      throw new NotFoundException('File not found');
    }

    if (file.status !== ProcessingStatus.COMPLETED) {
      throw new Error('File processing not completed yet');
    }

    // TODO: Generate actual tile URL template from S3 path
    return {
      url: `https://your-bucket.s3.amazonaws.com/${file.storagePath}/{z}/{x}/{y}.png`,
      bounds: file.bounds,
      crs: file.crs,
    };
  }
}