import { PrizesService } from './prizes.service';
import { CreatePrizeDto } from './dto/create-prize.dto';
import { UpdatePrizeDto } from './dto/update-prize.dto';
export declare class PrizesController {
    private readonly prizesService;
    constructor(prizesService: PrizesService);
    create(createPrizeDto: CreatePrizeDto): Promise<{
        JOGO: {
            id_jogo: number;
            data_hora: Date;
        };
    } & {
        descricao: string;
        valor: import("@prisma/client/runtime/library").Decimal;
        id_premio: number;
        id_usuario: number | null;
        id_jogo: number;
    }>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        JOGO: {
            id_jogo: number;
            SALA: {
                nome: string;
            };
        };
        USUARIO: {
            id_usuario: number;
            nome: string;
            email: string;
        };
    } & {
        descricao: string;
        valor: import("@prisma/client/runtime/library").Decimal;
        id_premio: number;
        id_usuario: number | null;
        id_jogo: number;
    })[]>;
    findOne(id: number): Promise<{
        JOGO: {
            id_jogo: number;
            data_hora: Date;
            id_sala: number;
            id_usuario_vencedor: number | null;
            preco_cartela: import("@prisma/client/runtime/library").Decimal;
        };
        USUARIO: {
            id_usuario: number;
            nome: string;
        };
    } & {
        descricao: string;
        valor: import("@prisma/client/runtime/library").Decimal;
        id_premio: number;
        id_usuario: number | null;
        id_jogo: number;
    }>;
    update(id: number, updatePrizeDto: UpdatePrizeDto): Promise<{
        USUARIO: {
            nome: string;
        };
    } & {
        descricao: string;
        valor: import("@prisma/client/runtime/library").Decimal;
        id_premio: number;
        id_usuario: number | null;
        id_jogo: number;
    }>;
    remove(id: number): Promise<{
        descricao: string;
        valor: import("@prisma/client/runtime/library").Decimal;
        id_premio: number;
        id_usuario: number | null;
        id_jogo: number;
    }>;
}
