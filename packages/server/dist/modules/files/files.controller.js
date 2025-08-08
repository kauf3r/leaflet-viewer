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
exports.FilesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const files_service_1 = require("./files.service");
let FilesController = class FilesController {
    constructor(filesService) {
        this.filesService = filesService;
    }
    async uploadFile(file) {
        return this.filesService.uploadFile(file);
    }
    async getStatus(id) {
        return this.filesService.getStatus(id);
    }
    async getTileConfig(id) {
        return this.filesService.getTileConfig(id);
    }
};
exports.FilesController = FilesController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload a GeoTIFF file for processing' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiResponse)({ status: 202, description: 'File accepted for processing' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Get)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get file processing status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'File status retrieved' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Get)(':id/tiles'),
    (0, swagger_1.ApiOperation)({ summary: 'Get tile configuration for file' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tile configuration retrieved' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "getTileConfig", null);
exports.FilesController = FilesController = __decorate([
    (0, swagger_1.ApiTags)('files'),
    (0, common_1.Controller)('files'),
    __metadata("design:paramtypes", [files_service_1.FilesService])
], FilesController);
//# sourceMappingURL=files.controller.js.map