import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { AuthenticatedRequest } from './interfaces/authenticated-request.interface';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(createUserDto: CreateUserDto): Promise<{
        nome: string;
        email: string;
        is_admin: boolean;
        id_usuario: number;
    }>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
    }>;
    getProfile(req: AuthenticatedRequest): Promise<{
        nome: string;
        email: string;
        is_admin: boolean;
        id_usuario: number;
        creditos: import("@prisma/client/runtime/library").Decimal;
    }>;
}
