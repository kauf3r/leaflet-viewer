import { FilesService } from './files.service';
export declare class FilesController {
    private readonly filesService;
    constructor(filesService: FilesService);
    uploadFile(file: Express.Multer.File): Promise<{
        id: string;
        status: import("./enums/processing-status.enum").ProcessingStatus;
        message: string;
    }>;
    getStatus(id: string): Promise<{
        id: string;
        originalFilename: string;
        status: import("./enums/processing-status.enum").ProcessingStatus;
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
