import { Repository } from 'typeorm';
import { GeospatialFile } from './entities/geospatial-file.entity';
import { ProcessingStatus } from './enums/processing-status.enum';
export declare class FilesService {
    private readonly filesRepository;
    constructor(filesRepository: Repository<GeospatialFile>);
    uploadFile(file: Express.Multer.File): Promise<{
        id: string;
        status: ProcessingStatus;
        message: string;
    }>;
    getStatus(id: string): Promise<{
        id: string;
        originalFilename: string;
        status: ProcessingStatus;
        fileSize: number;
        crs: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getTileConfig(id: string): Promise<{
        url: string;
        bounds: {
            north: number;
            south: number;
            east: number;
            west: number;
        };
        crs: string;
    }>;
}
