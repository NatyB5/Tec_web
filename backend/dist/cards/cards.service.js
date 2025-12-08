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
exports.CardsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../shared/prisma/prisma.service");
let CardsService = class CardsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.CARD_NUMBERS_COUNT = 24;
    }
    generateUniqueCardNumbers() {
        const numbers = new Set();
        while (numbers.size < this.CARD_NUMBERS_COUNT) {
            const num = Math.floor(Math.random() * 75) + 1;
            numbers.add(num);
        }
        return Array.from(numbers);
    }
    async create(createCardDto) {
        const { id_jogo, id_usuario } = createCardDto;
        const game = await this.prisma.jOGO.findUnique({
            where: { id_jogo },
        });
        if (!game) {
            throw new common_1.NotFoundException(`Jogo com ID ${id_jogo} não encontrado.`);
        }
        const user = await this.prisma.uSUARIO.findUnique({
            where: { id_usuario },
        });
        if (!user) {
            throw new common_1.NotFoundException(`Usuário com ID ${id_usuario} não encontrado.`);
        }
        if (new Date() >= game.data_hora) {
            throw new common_1.BadRequestException('Não é possível criar cartelas para um jogo que já começou.');
        }
        const cardNumbers = this.generateUniqueCardNumbers();
        return this.prisma.$transaction(async (tx) => {
            const newCard = await tx.cARTELA.create({
                data: {
                    id_jogo,
                    id_usuario,
                },
            });
            await tx.nUMEROS_CARTELA.createMany({
                data: cardNumbers.map(numero => ({
                    id_cartela: newCard.id_cartela,
                    numero,
                })),
            });
            return {
                ...newCard,
                numeros: cardNumbers,
            };
        });
    }
    async findAll(userId, gameId) {
        const where = {};
        if (userId) {
            where.id_usuario = userId;
        }
        if (gameId) {
            where.id_jogo = gameId;
        }
        return this.prisma.cARTELA.findMany({
            where,
            include: {
                USUARIO: {
                    select: {
                        id_usuario: true,
                        nome: true,
                        email: true,
                    },
                },
                JOGO: {
                    select: {
                        id_jogo: true,
                        data_hora: true,
                        SALA: {
                            select: {
                                nome: true,
                            },
                        },
                    },
                },
                NUMEROS_CARTELA: {
                    select: {
                        numero: true,
                    },
                },
            },
            orderBy: {
                id_cartela: 'desc',
            },
        });
    }
    async findOne(id, userId) {
        const where = { id_cartela: id };
        if (userId) {
            where.id_usuario = userId;
        }
        const card = await this.prisma.cARTELA.findUnique({
            where,
            include: {
                USUARIO: {
                    select: {
                        id_usuario: true,
                        nome: true,
                        email: true,
                    },
                },
                JOGO: {
                    select: {
                        id_jogo: true,
                        data_hora: true,
                        SALA: {
                            select: {
                                nome: true,
                            },
                        },
                    },
                },
                NUMEROS_CARTELA: {
                    select: {
                        numero: true,
                    },
                    orderBy: {
                        numero: 'asc',
                    },
                },
            },
        });
        if (!card) {
            throw new common_1.NotFoundException(`Cartela com ID ${id} não encontrada.`);
        }
        return card;
    }
    async remove(id, userId) {
        const where = { id_cartela: id };
        if (userId) {
            where.id_usuario = userId;
        }
        const card = await this.prisma.cARTELA.findUnique({
            where,
        });
        if (!card) {
            throw new common_1.NotFoundException(`Cartela com ID ${id} não encontrada.`);
        }
        const game = await this.prisma.jOGO.findUnique({
            where: { id_jogo: card.id_jogo },
        });
        if (game && new Date() >= game.data_hora) {
            throw new common_1.BadRequestException('Não é possível excluir cartelas de um jogo que já começou.');
        }
        await this.prisma.cARTELA.delete({
            where: { id_cartela: id },
        });
    }
    async getUserCards(userId, gameId) {
        const where = { id_usuario: userId };
        if (gameId) {
            where.id_jogo = gameId;
        }
        return this.prisma.cARTELA.findMany({
            where,
            include: {
                JOGO: {
                    select: {
                        id_jogo: true,
                        data_hora: true,
                        SALA: {
                            select: {
                                nome: true,
                            },
                        },
                    },
                },
                NUMEROS_CARTELA: {
                    select: {
                        numero: true,
                    },
                    orderBy: {
                        numero: 'asc',
                    },
                },
            },
            orderBy: {
                id_cartela: 'desc',
            },
        });
    }
};
exports.CardsService = CardsService;
exports.CardsService = CardsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CardsService);
//# sourceMappingURL=cards.service.js.map