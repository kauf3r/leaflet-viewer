export declare class ProcessingService {
    processGeoTIFF(filePath: string, fileId: string): Promise<void>;
    validateGeoTIFF(filePath: string): Promise<boolean>;
    extractMetadata(filePath: string): Promise<any>;
}
