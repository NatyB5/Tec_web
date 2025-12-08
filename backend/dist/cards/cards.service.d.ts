import { PrismaService } from '../shared/prisma/prisma.service';
import { CreateCardDto } from './dto/create-card.dto';
export declare class CardsService {
    private readonly prisma;
    private readonly CARD_NUMBERS_COUNT;
    constructor(prisma: PrismaService);
    private generateUniqueCardNumbers;
    create(createCardDto: CreateCardDto): Promise<{
        numeros: number[];
        id_usuario: number;
        id_cartela: number;
        id_jogo: number;
    }>;
    findAll(userId?: number, gameId?: number): Promise<({
        JOGO: {
            id_jogo: number;
            data_hora: Date;
            SALA: {
                nome: string;
            };
        };
        USUARIO: {
            id_usuario: number;
            email: string;
            nome: string;
        };
        NUMEROS_CARTELA: {
            numero: number;
        }[];
    } & {
        id_usuario: number;
        id_cartela: number;
        id_jogo: number;
    })[]>;
    findOne(id: number, userId?: number): Promise<{
        JOGO: {
            id_jogo: number;
            data_hora: Date;
            SALA: {
                nome: string;
            };
        };
        USUARIO: {
            id_usuario: number;
            email: string;
            nome: string;
        };
        NUMEROS_CARTELA: {
            numero: number;
        }[];
    } & {
        id_usuario: number;
        id_cartela: number;
        id_jogo: number;
    }>;
    remove(id: number, userId?: number): Promise<void>;
    getUserCards(userId: number, gameId?: number): Promise<({
        JOGO: {
            id_jogo: number;
            data_hora: Date;
            SALA: {
                nome: string;
            };
        };
        NUMEROS_CARTELA: {
            numero: number;
        }[];
    } & {
        id_usuario: number;
        id_cartela: number;
        id_jogo: number;
    })[]>;
}
