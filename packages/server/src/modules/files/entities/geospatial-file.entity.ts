import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProcessingStatus } from '../enums/processing-status.enum';

@Entity('geospatial_files')
export class GeospatialFile {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  originalFilename: string;

  @Column()
  storagePath: string;

  @Column({ nullable: true })
  crs: string;

  @Column({
    type: 'enum',
    enum: ProcessingStatus,
    default: ProcessingStatus.UPLOADING,
  })
  status: ProcessingStatus;

  @Column('bigint')
  fileSize: number;

  @Column('json', { nullable: true })
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };

  @Column('json', { nullable: true })
  metadata: {
    width?: number;
    height?: number;
    pixelSize?: [number, number];
    bands?: number;
    compression?: string;
    overview?: boolean;
  };

  @Column('text', { nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}