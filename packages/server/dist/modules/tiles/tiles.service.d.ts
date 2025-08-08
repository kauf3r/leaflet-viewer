export declare class TilesService {
    getTile(fileId: string, z: number, x: number, y: number): Promise<Buffer>;
    validateTileRequest(fileId: string, z: number, x: number, y: number): Promise<boolean>;
}
