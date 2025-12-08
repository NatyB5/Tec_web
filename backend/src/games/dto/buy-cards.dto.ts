// path: src/games/dto/buy-cards.dto.ts
import { IsInt, IsPositive, Max, IsNotEmpty } from 'class-validator';

export class BuyCardsDto {
    @IsInt({ message: "O ID do jogo deve ser um número inteiro." })
    @IsNotEmpty({ message: "O ID do jogo é obrigatório." })
    id_jogo: number; // <--- Este campo estava faltando!

    @IsInt({ message: "A quantidade deve ser um número inteiro."})
    @IsPositive({ message: "A quantidade deve ser um número positivo."})
    @Max(10, { message: "Você pode comprar no máximo 10 cartelas por vez."})
    quantity: number;
}