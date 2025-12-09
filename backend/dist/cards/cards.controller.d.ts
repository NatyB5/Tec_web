import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
export declare class CardsController {
    private readonly cardsService;
    constructor(cardsService: CardsService);
    create(createCardDto: CreateCardDto): Promise<{
        numeros: number[];
        id_usuario: number;
        id_cartela: number;
        id_jogo: number;
    }>;
    findAll(userId?: string, gameId?: string): Promise<({
        JOGO: {
            id_jogo: number;
            data_hora: Date;
            SALA: {
                nome: string;
            };
        };
        USUARIO: {
            nome: string;
            email: string;
            id_usuario: number;
        };
        NUMEROS_CARTELA: {
            numero: number;
        }[];
    } & {
        id_usuario: number;
        id_cartela: number;
        id_jogo: number;
    })[]>;
    findOne(id: number): Promise<{
        JOGO: {
            id_jogo: number;
            data_hora: Date;
            SALA: {
                nome: string;
            };
        };
        USUARIO: {
            nome: string;
            email: string;
            id_usuario: number;
        };
        NUMEROS_CARTELA: {
            numero: number;
        }[];
    } & {
        id_usuario: number;
        id_cartela: number;
        id_jogo: number;
    }>;
    remove(id: number): Promise<void>;
    getMyCards(req: AuthenticatedRequest, gameId?: string): Promise<({
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
    getMyCard(req: AuthenticatedRequest, id: number): Promise<{
        JOGO: {
            id_jogo: number;
            data_hora: Date;
            SALA: {
                nome: string;
            };
        };
        USUARIO: {
            nome: string;
            email: string;
            id_usuario: number;
        };
        NUMEROS_CARTELA: {
            numero: number;
        }[];
    } & {
        id_usuario: number;
        id_cartela: number;
        id_jogo: number;
    }>;
    removeMyCard(req: AuthenticatedRequest, id: number): Promise<void>;
}
