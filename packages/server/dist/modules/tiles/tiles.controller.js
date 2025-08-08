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
exports.TilesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tiles_service_1 = require("./tiles.service");
let TilesController = class TilesController {
    constructor(tilesService) {
        this.tilesService = tilesService;
    }
    async getTile(fileId, z, x, y, res) {
        const tile = await this.tilesService.getTile(fileId, parseInt(z), parseInt(x), parseInt(y));
        res.set({
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=31536000, immutable',
        });
        res.send(tile);
    }
};
exports.TilesController = TilesController;
__decorate([
    (0, common_1.Get)(':fileId/:z/:x/:y.png'),
    (0, swagger_1.ApiOperation)({ summary: 'Get map tile for file' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tile image returned' }),
    __param(0, (0, common_1.Param)('fileId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('z')),
    __param(2, (0, common_1.Param)('x')),
    __param(3, (0, common_1.Param)('y')),
    __param(4, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], TilesController.prototype, "getTile", null);
exports.TilesController = TilesController = __decorate([
    (0, swagger_1.ApiTags)('tiles'),
    (0, common_1.Controller)('tiles'),
    __metadata("design:paramtypes", [tiles_service_1.TilesService])
], TilesController);
//# sourceMappingURL=tiles.controller.js.map