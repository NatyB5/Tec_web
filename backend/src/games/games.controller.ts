import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Sse,   
  Query, 
  MessageEvent
} from '@nestjs/common';
import { GamesService } from './games.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { BuyCardsDto } from './dto/buy-cards.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { IsPublic } from '../auth/decorators/is-public.decorator';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { GameLogicService } from '../bingo-engine/game-logic/game-logic.service';
import { map, filter } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Controller('games')
export class GamesController {
  constructor(
    private readonly gamesService: GamesService,
    private readonly gameLogic: GameLogicService
  ) {}

  // --- MÉTODOS EXISTENTES (CRUD) ---
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  create(@Body() createGameDto: CreateGameDto) {
    return this.gamesService.create(createGameDto);
  }

  @Get()
  findAll() {
    return this.gamesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gamesService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGameDto: UpdateGameDto) {
    return this.gamesService.update(+id, updateGameDto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gamesService.remove(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('buy-cards')
  buyCards(@Body() buyCardsDto: BuyCardsDto, @Req() req: AuthenticatedRequest) {
    // Garante que o usuário logado é quem está comprando
    const userId = req.user.sub;
    return this.gamesService.buyCards(userId, buyCardsDto.id_jogo, buyCardsDto.quantity);
  }

  // --- NOVOS MÉTODOS (SSE / REAL-TIME) ---

  /**
   * Endpoint SSE: O navegador conecta aqui para "escutar" o jogo.
   * Rota: GET /games/:id/stream?userId=123
   */
  @IsPublic()
  @Sse(':id/stream')
  stream(
    @Param('id') gameIdStr: string,
    @Query('userId') userId: string
  ): Observable<MessageEvent> { // Retorna um Observable
    const gameId = Number(gameIdStr);
    
    // 1. Avisa a lógica que um jogador entrou na sala
    this.gameLogic.handleConnection(gameId, userId);

    // 2. Retorna o fluxo de eventos filtrado apenas para este jogo
    return this.gameLogic.getEventStream().pipe(
      filter((event) => event.gameId === gameId),
      map((event) => ({ 
        data: { type: event.type, data: event.data } 
      } as MessageEvent))
    );
  }

  /**
   * Admin inicia o sorteio
   * Rota: POST /games/:id/start
   */
  @UseGuards(JwtAuthGuard, AdminGuard) // Protegido para apenas admin
  @Post(':id/start')
  startGame(@Param('id') id: string) {
    return this.gameLogic.startGame(Number(id));
  }

  /**
   * Admin para o sorteio manualmente
   * Rota: POST /games/:id/stop
   */
  @UseGuards(JwtAuthGuard, AdminGuard) // Protegido para apenas admin
  @Post(':id/stop')
  stopGame(@Param('id') id: string) {
    return this.gameLogic.stopGame(Number(id));
  }
}