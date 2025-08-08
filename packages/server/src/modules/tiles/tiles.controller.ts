import { Controller, Get, Param, Res, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { TilesService } from './tiles.service';

@ApiTags('tiles')
@Controller('tiles')
export class TilesController {
  constructor(private readonly tilesService: TilesService) {}

  @Get(':fileId/:z/:x/:y.png')
  @ApiOperation({ summary: 'Get map tile for file' })
  @ApiResponse({ status: 200, description: 'Tile image returned' })
  async getTile(
    @Param('fileId', ParseUUIDPipe) fileId: string,
    @Param('z') z: string,
    @Param('x') x: string,
    @Param('y') y: string,
    @Res() res: Response,
  ) {
    const tile = await this.tilesService.getTile(fileId, parseInt(z), parseInt(x), parseInt(y));
    
    res.set({
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    });
    
    res.send(tile);
  }
}