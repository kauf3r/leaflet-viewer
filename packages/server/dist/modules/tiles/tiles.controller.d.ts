import { Response } from 'express';
import { TilesService } from './tiles.service';
export declare class TilesController {
    private readonly tilesService;
    constructor(tilesService: TilesService);
    getTile(fileId: string, z: string, x: string, y: string, res: Response): Promise<void>;
}
