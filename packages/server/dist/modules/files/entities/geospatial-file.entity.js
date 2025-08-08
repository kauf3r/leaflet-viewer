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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeospatialFile = void 0;
const typeorm_1 = require("typeorm");
const processing_status_enum_1 = require("../enums/processing-status.enum");
let GeospatialFile = class GeospatialFile {
};
exports.GeospatialFile = GeospatialFile;
__decorate([
    (0, typeorm_1.PrimaryColumn)('uuid'),
    __metadata("design:type", String)
], GeospatialFile.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], GeospatialFile.prototype, "originalFilename", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], GeospatialFile.prototype, "storagePath", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], GeospatialFile.prototype, "crs", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: processing_status_enum_1.ProcessingStatus,
        default: processing_status_enum_1.ProcessingStatus.UPLOADING,
    }),
    __metadata("design:type", String)
], GeospatialFile.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('bigint'),
    __metadata("design:type", Number)
], GeospatialFile.prototype, "fileSize", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Object)
], GeospatialFile.prototype, "bounds", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Object)
], GeospatialFile.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], GeospatialFile.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], GeospatialFile.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], GeospatialFile.prototype, "updatedAt", void 0);
exports.GeospatialFile = GeospatialFile = __decorate([
    (0, typeorm_1.Entity)('geospatial_files')
], GeospatialFile);
//# sourceMappingURL=geospatial-file.entity.js.map