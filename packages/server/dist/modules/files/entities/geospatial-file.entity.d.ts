import { ProcessingStatus } from '../enums/processing-status.enum';
export declare class GeospatialFile {
    id: string;
    originalFilename: string;
    storagePath: string;
    crs: string;
    status: ProcessingStatus;
    fileSize: number;
    bounds: {
        north: number;
        south: number;
        east: number;
        west: number;
    };
    metadata: {
        width?: number;
        height?: number;
        pixelSize?: [number, number];
        bands?: number;
        compression?: string;
        overview?: boolean;
    };
    errorMessage: string;
    createdAt: Date;
    updatedAt: Date;
}
