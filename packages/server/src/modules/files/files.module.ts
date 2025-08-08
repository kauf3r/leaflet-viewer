import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { GeospatialFile } from './entities/geospatial-file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GeospatialFile])],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}