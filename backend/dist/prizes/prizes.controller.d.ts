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
        id_usuario: number | null;
        id_jogo: number;
        descricao: string;
        valor: import("@prisma/client/runtime/library").Decimal;
        id_premio: number;
    }>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        JOGO: {
            id_jogo: number;
            SALA: {
                nome: string;
            };
        };
        USUARIO: {
            nome: string;
            email: string;
            id_usuario: number;
        };
    } & {
        id_usuario: number | null;
        id_jogo: number;
        descricao: string;
        valor: import("@prisma/client/runtime/library").Decimal;
        id_premio: number;
    })[]>;
    findOne(id: number): Promise<{
        JOGO: {
            id_jogo: number;
            data_hora: Date;
            preco_cartela: import("@prisma/client/runtime/library").Decimal;
            id_sala: number;
            id_usuario_vencedor: number | null;
        };
        USUARIO: {
            nome: string;
            id_usuario: number;
        };
    } & {
        id_usuario: number | null;
        id_jogo: number;
        descricao: string;
        valor: import("@prisma/client/runtime/library").Decimal;
        id_premio: number;
    }>;
    update(id: number, updatePrizeDto: UpdatePrizeDto): Promise<{
        USUARIO: {
            nome: string;
        };
    } & {
        id_usuario: number | null;
        id_jogo: number;
        descricao: string;
        valor: import("@prisma/client/runtime/library").Decimal;
        id_premio: number;
    }>;
    remove(id: number): Promise<{
        id_usuario: number | null;
        id_jogo: number;
        descricao: string;
        valor: import("@prisma/client/runtime/library").Decimal;
        id_premio: number;
    }>;
}
