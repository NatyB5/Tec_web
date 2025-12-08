// path: src/prizes/dto/create-prize.dto.ts
import { IsNotEmpty, IsNumber, IsPositive, IsString, IsOptional } from 'class-validator';

export class CreatePrizeDto {
    @IsString()
    @IsNotEmpty()
    descricao: string;
    
    @IsNumber()
    @IsPositive()
    valor: number;
    
    @IsNumber()
    @IsPositive()
    id_jogo: number;
}
