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
exports.PrizesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../shared/prisma/prisma.service");
const client_1 = require("@prisma/client");
let PrizesService = class PrizesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createPrizeDto) {
        const { id_jogo } = createPrizeDto;
        const game = await this.prisma.jOGO.findUnique({
            where: { id_jogo },
        });
        if (!game) {
            throw new common_1.NotFoundException(`Jogo com ID ${id_jogo} não encontrado.`);
        }
        const data = {
            descricao: createPrizeDto.descricao,
            valor: new client_1.Prisma.Decimal(createPrizeDto.valor),
            JOGO: {
                connect: { id_jogo },
            },
        };
        return this.prisma.pREMIOS.create({
            data,
            include: {
                JOGO: {
                    select: {
                        id_jogo: true,
                        data_hora: true,
                    },
                },
            },
        });
    }
    findAll() {
        return this.prisma.pREMIOS.findMany({
            include: {
                JOGO: {
                    select: {
                        id_jogo: true,
                        SALA: { select: { nome: true } }
                    }
                },
                USUARIO: {
                    select: {
                        id_usuario: true,
                        nome: true,
                        email: true,
                    },
                },
            },
        });
    }
    async findOne(id) {
        const prize = await this.prisma.pREMIOS.findUnique({
            where: { id_premio: id },
            include: {
                JOGO: true,
                USUARIO: {
                    select: {
                        id_usuario: true,
                        nome: true,
                    },
                },
            },
        });
        if (!prize) {
            throw new common_1.NotFoundException(`Prêmio com ID ${id} não encontrado.`);
        }
        return prize;
    }
    async update(id, updatePrizeDto) {
        await this.findOne(id);
        const data = {};
        if (updatePrizeDto.descricao) {
            data.descricao = updatePrizeDto.descricao;
        }
        if (updatePrizeDto.valor) {
            data.valor = new client_1.Prisma.Decimal(updatePrizeDto.valor);
        }
        return this.prisma.pREMIOS.update({
            where: { id_premio: id },
            data,
            include: {
                USUARIO: { select: { nome: true } }
            }
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.pREMIOS.delete({
            where: { id_premio: id },
        });
    }
};
exports.PrizesService = PrizesService;
exports.PrizesService = PrizesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrizesService);
//# sourceMappingURL=prizes.service.js.map