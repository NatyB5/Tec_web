import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { RechargeCreditsDto } from './dto/recharge-credits.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(req: AuthenticatedRequest): Promise<{
        nome: string;
        email: string;
        is_admin: boolean;
        id_usuario: number;
        creditos: import("@prisma/client/runtime/library").Decimal;
    }>;
    updateProfile(req: AuthenticatedRequest, updateUserDto: UpdateUserDto): Promise<{
        nome: string;
        email: string;
        id_usuario: number;
    }>;
    rechargeCredits(req: AuthenticatedRequest, rechargeCreditsDto: RechargeCreditsDto): Promise<{
        message: string;
        newBalance: import("@prisma/client/runtime/library").Decimal;
    }>;
    createByAdmin(createUserDto: CreateUserDto): Promise<{
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
        creditos: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    findOne(id: number): Promise<{
        nome: string;
        email: string;
        is_admin: boolean;
        id_usuario: number;
        creditos: import("@prisma/client/runtime/library").Decimal;
    }>;
    remove(id: number): Promise<void>;
}
