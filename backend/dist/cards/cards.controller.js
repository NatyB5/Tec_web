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
exports.CardsController = void 0;
const common_1 = require("@nestjs/common");
const cards_service_1 = require("./cards.service");
const create_card_dto_1 = require("./dto/create-card.dto");
const admin_guard_1 = require("../auth/guards/admin.guard");
let CardsController = class CardsController {
    constructor(cardsService) {
        this.cardsService = cardsService;
    }
    create(createCardDto) {
        return this.cardsService.create(createCardDto);
    }
    findAll(userId, gameId) {
        return this.cardsService.findAll(userId ? parseInt(userId) : undefined, gameId ? parseInt(gameId) : undefined);
    }
    findOne(id) {
        return this.cardsService.findOne(id);
    }
    remove(id) {
        return this.cardsService.remove(id);
    }
    getMyCards(req, gameId) {
        return this.cardsService.getUserCards(req.user.sub, gameId ? parseInt(gameId) : undefined);
    }
    getMyCard(req, id) {
        return this.cardsService.findOne(id, req.user.sub);
    }
    removeMyCard(req, id) {
        return this.cardsService.remove(id, req.user.sub);
    }
};
exports.CardsController = CardsController;
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_card_dto_1.CreateCardDto]),
    __metadata("design:returntype", void 0)
], CardsController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('gameId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CardsController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CardsController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CardsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('my/cards'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('gameId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CardsController.prototype, "getMyCards", null);
__decorate([
    (0, common_1.Get)('my/cards/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], CardsController.prototype, "getMyCard", null);
__decorate([
    (0, common_1.Delete)('my/cards/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], CardsController.prototype, "removeMyCard", null);
exports.CardsController = CardsController = __decorate([
    (0, common_1.Controller)('cards'),
    __metadata("design:paramtypes", [cards_service_1.CardsService])
], CardsController);
//# sourceMappingURL=cards.controller.js.map