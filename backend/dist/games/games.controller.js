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
exports.GamesController = void 0;
const common_1 = require("@nestjs/common");
const games_service_1 = require("./games.service");
const create_game_dto_1 = require("./dto/create-game.dto");
const update_game_dto_1 = require("./dto/update-game.dto");
const buy_cards_dto_1 = require("./dto/buy-cards.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const admin_guard_1 = require("../auth/guards/admin.guard");
const is_public_decorator_1 = require("../auth/decorators/is-public.decorator");
const game_logic_service_1 = require("../bingo-engine/game-logic/game-logic.service");
const operators_1 = require("rxjs/operators");
const rxjs_1 = require("rxjs");
let GamesController = class GamesController {
    constructor(gamesService, gameLogic) {
        this.gamesService = gamesService;
        this.gameLogic = gameLogic;
    }
    create(createGameDto) {
        return this.gamesService.create(createGameDto);
    }
    findAll() {
        return this.gamesService.findAll();
    }
    findOne(id) {
        return this.gamesService.findOne(+id);
    }
    update(id, updateGameDto) {
        return this.gamesService.update(+id, updateGameDto);
    }
    remove(id) {
        return this.gamesService.remove(+id);
    }
    buyCards(buyCardsDto, req) {
        const userId = req.user.sub;
        return this.gamesService.buyCards(userId, buyCardsDto.id_jogo, buyCardsDto.quantity);
    }
    stream(gameIdStr, userId) {
        const gameId = Number(gameIdStr);
        this.gameLogic.handleConnection(gameId, userId);
        return this.gameLogic.getEventStream().pipe((0, operators_1.filter)((event) => event.gameId === gameId), (0, operators_1.map)((event) => ({
            data: { type: event.type, data: event.data }
        })));
    }
    startGame(id) {
        return this.gameLogic.startGame(Number(id));
    }
    stopGame(id) {
        return this.gameLogic.stopGame(Number(id));
    }
};
exports.GamesController = GamesController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_game_dto_1.CreateGameDto]),
    __metadata("design:returntype", void 0)
], GamesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GamesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GamesController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_game_dto_1.UpdateGameDto]),
    __metadata("design:returntype", void 0)
], GamesController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GamesController.prototype, "remove", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('buy-cards'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [buy_cards_dto_1.BuyCardsDto, Object]),
    __metadata("design:returntype", void 0)
], GamesController.prototype, "buyCards", null);
__decorate([
    (0, is_public_decorator_1.IsPublic)(),
    (0, common_1.Sse)(':id/stream'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", rxjs_1.Observable)
], GamesController.prototype, "stream", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, common_1.Post)(':id/start'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GamesController.prototype, "startGame", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, common_1.Post)(':id/stop'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GamesController.prototype, "stopGame", null);
exports.GamesController = GamesController = __decorate([
    (0, common_1.Controller)('games'),
    __metadata("design:paramtypes", [games_service_1.GamesService,
        game_logic_service_1.GameLogicService])
], GamesController);
//# sourceMappingURL=games.controller.js.map