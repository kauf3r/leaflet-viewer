import {
  Controller,
  Get,
  Post,
  Param,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { FilesService } from './files.service';

@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a GeoTIFF file for processing' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 202, description: 'File accepted for processing' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.filesService.uploadFile(file);
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Get file processing status' })
  @ApiResponse({ status: 200, description: 'File status retrieved' })
  async getStatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.filesService.getStatus(id);
  }

  @Get(':id/tiles')
  @ApiOperation({ summary: 'Get tile configuration for file' })
  @ApiResponse({ status: 200, description: 'Tile configuration retrieved' })
  async getTileConfig(@Param('id', ParseUUIDPipe) id: string) {
    return this.filesService.getTileConfig(id);
  }
}