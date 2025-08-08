"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessingService = void 0;
const common_1 = require("@nestjs/common");
let ProcessingService = class ProcessingService {
    async processGeoTIFF(filePath, fileId) {
        console.log(`Processing GeoTIFF: ${filePath} (${fileId})`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`Completed processing: ${fileId}`);
    }
    async validateGeoTIFF(filePath) {
        return true;
    }
    async extractMetadata(filePath) {
        return {
            crs: 'EPSG:4326',
            bounds: { north: 90, south: -90, east: 180, west: -180 },
            width: 1024,
            height: 1024,
        };
    }
};
exports.ProcessingService = ProcessingService;
exports.ProcessingService = ProcessingService = __decorate([
    (0, common_1.Injectable)()
], ProcessingService);
//# sourceMappingURL=processing.service.js.map