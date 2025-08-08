"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const geospatial_file_entity_1 = require("./entities/geospatial-file.entity");
const processing_status_enum_1 = require("./enums/processing-status.enum");
const uuid_1 = require("uuid");
let FilesService = class FilesService {
    constructor(filesRepository) {
        this.filesRepository = filesRepository;
    }
    async uploadFile(file) {
        const supportedExtensions = ['.tif', '.tiff', '.gtiff'];
        const fileExtension = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
        if (!supportedExtensions.includes(fileExtension)) {
            throw new Error('Unsupported file format. Please upload a GeoTIFF file.');
        }
        const geospatialFile = this.filesRepository.create({
            id: (0, uuid_1.v4)(),
            originalFilename: file.originalname,
            fileSize: file.size,
            status: processing_status_enum_1.ProcessingStatus.UPLOADING,
            storagePath: '',
            crs: '',
        });
        await this.filesRepository.save(geospatialFile);
        return {
            id: geospatialFile.id,
            status: geospatialFile.status,
            message: 'File uploaded successfully and queued for processing',
        };
    }
    async getStatus(id) {
        const file = await this.filesRepository.findOne({ where: { id } });
        if (!file) {
            throw new common_1.NotFoundException('File not found');
        }
        return {
            id: file.id,
            originalFilename: file.originalFilename,
            status: file.status,
            fileSize: file.fileSize,
            crs: file.crs,
            createdAt: file.createdAt,
            updatedAt: file.updatedAt,
        };
    }
    async getTileConfig(id) {
        const file = await this.filesRepository.findOne({ where: { id } });
        if (!file) {
            throw new common_1.NotFoundException('File not found');
        }
        if (file.status !== processing_status_enum_1.ProcessingStatus.COMPLETED) {
            throw new Error('File processing not completed yet');
        }
        return {
            url: `https://your-bucket.s3.amazonaws.com/${file.storagePath}/{z}/{x}/{y}.png`,
            bounds: file.bounds,
            crs: file.crs,
        };
    }
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(geospatial_file_entity_1.GeospatialFile)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], FilesService);
//# sourceMappingURL=files.service.js.map