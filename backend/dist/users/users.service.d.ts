import { PrismaService } from '../shared/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma } from '@prisma/client';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createUserDto: CreateUserDto, isAdmin: boolean): Promise<{
        nome: string;
        email: string;
        is_admin: boolean;
        id_usuario: number;
    }>;
    findAll(): Promise<{
        nome: string;
        email: string;
        is_admin: boolean;
        id_usuario: number;
        creditos: Prisma.Decimal;
    }[]>;
    findById(id: number): Promise<{
        nome: string;
        email: string;
        is_admin: boolean;
        id_usuario: number;
        creditos: Prisma.Decimal;
    }>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<{
        nome: string;
        email: string;
        id_usuario: number;
    }>;
    remove(id: number): Promise<void>;
    rechargeCredits(userId: number, amount: number): Promise<{
        message: string;
        newBalance: Prisma.Decimal;
    }>;
}
