import { Injectable, Logger } from '@nestjs/common';
import { Subject } from 'rxjs';
import { UsersService } from '../../users/users.service';
import { CardsService } from '../../cards/cards.service';
import { PrismaService } from '../../shared/prisma/prisma.service';

export interface GameEvent {
  gameId: number;
  type: string;
  data: any;
}

interface GameState {
  numberPool: number[];
  drawnNumbers: Set<number>;
  drawInterval: NodeJS.Timeout | null;
  activePlayers: Map<number, { user: any; cards: { id: number; matrix: number[][] }[] }>;
  winningCards: Set<number>;
}

@Injectable()
export class GameLogicService {
  private readonly logger = new Logger(GameLogicService.name);
  
  private runningGames = new Map<number, GameState>();
  private gameEvents$ = new Subject<GameEvent>();

  constructor(
    private usersService: UsersService,
    private cardsService: CardsService,
    private prisma: PrismaService,
  ) {}

  getEventStream() {
    return this.gameEvents$.asObservable();
  }

  // --- CONEXÃO ---
  async handleConnection(gameId: number, userIdString: string) {
    const userId = Number(userIdString);
    if (isNaN(userId) || isNaN(gameId)) return;

    let gameState = this.runningGames.get(gameId);
    if (!gameState) {
      gameState = this.createInitialState();
      this.runningGames.set(gameId, gameState);
    }

    // Reconexão: apenas atualiza log e envia estado
    if (gameState.activePlayers.has(userId)) {
        this.emitEvent(gameId, 'init', { drawnNumbers: Array.from(gameState.drawnNumbers) });
        return;
    }

    try {
      const user = await this.usersService.findById(userId);
      const dbCards = await this.cardsService.getUserCards(userId, gameId);

      const matrixCards = dbCards.map(c => ({
        id: c.id_cartela,
        matrix: this.convertDbListToMatrix(c.NUMEROS_CARTELA.map(n => n.numero))
      }));

      gameState.activePlayers.set(userId, { user, cards: matrixCards });
      this.logger.log(`User ${user.nome} entrou no Jogo ${gameId} com ${matrixCards.length} cartelas.`);

      this.emitEvent(gameId, 'init', { 
        drawnNumbers: Array.from(gameState.drawnNumbers) 
      });

    } catch (error) {
      this.logger.error(`Erro conexão user ${userId}: ${error.message}`);
    }
  }

  // --- CONTROLE ---
  async startGame(gameId: number) {
    let state = this.runningGames.get(gameId);
    if (!state) {
      state = this.createInitialState();
      this.runningGames.set(gameId, state);
    }

    if (state.drawInterval) return { error: 'Jogo já rodando' };

    // Verifica se existem prêmios cadastrados
    const prizesCount = await this.prisma.pREMIOS.count({ where: { id_jogo: gameId } });
    if (prizesCount === 0) {
        this.logger.warn(`⚠️ Jogo ${gameId} iniciado SEM PRÊMIOS! O jogo não irá parar automaticamente.`);
    }

    // Se pool vazio, reinicia
    if (state.numberPool.length === 0) {
       state.numberPool = this.shuffledPool(75);
       state.drawnNumbers.clear();
       state.winningCards.clear();
       this.emitEvent(gameId, 'reset', {});
    }

    this.logger.log(`Iniciando sorteio Jogo ${gameId}`);
    state.drawInterval = setInterval(() => this.drawNextNumber(gameId), 5000);
    
    return { ok: true };
  }

  stopGame(gameId: number) {
    const state = this.runningGames.get(gameId);
    if (state?.drawInterval) {
      clearInterval(state.drawInterval);
      state.drawInterval = null;
      this.logger.log(`Jogo ${gameId} pausado/parado.`);
    }
    return { ok: true };
  }

  // --- SORTEIO ---
  private drawNextNumber(gameId: number) {
    const state = this.runningGames.get(gameId);
    if (!state) return;

    if (state.numberPool.length === 0) {
      this.stopGame(gameId);
      this.emitEvent(gameId, 'end', { message: 'Fim dos números - Sem mais prêmios?' });
      return;
    }

    const n = state.numberPool.shift();
    if (n) {
      state.drawnNumbers.add(n);
      this.logger.log(`Jogo ${gameId}: Bola ${n}`);

      this.emitEvent(gameId, 'number_drawn', { 
        number: n, 
        drawnNumbers: Array.from(state.drawnNumbers) 
      });

      this.saveDrawnNumber(gameId, n, state.drawnNumbers.size);

      // Conferência de ganhadores a cada bola
      this.checkForBingoWinners(gameId, state, n);
    }
  }

  private async checkForBingoWinners(gameId: number, state: GameState, lastNumber: number) {
    // Itera sobre todos os jogadores
    for (const [userId, data] of state.activePlayers.entries()) {
      
      // Itera sobre cartelas do jogador
      for (const card of data.cards) {
        // Se a cartela já ganhou, pula
        if (state.winningCards.has(card.id)) continue;

        if (this.checkBingo(card.matrix, state.drawnNumbers)) {
          
          // Tenta atribuir prêmio
          const won = await this.assignPrizeToWinner(gameId, userId, data.user.nome);
          
          if (won) {
            // Marca a cartela como vencedora para não ganhar de novo
            state.winningCards.add(card.id);
          }
        }
      }
    }
  }

  // --- NOVA LÓGICA DE PRÊMIOS ---
  
  private async assignPrizeToWinner(gameId: number, userId: number, userName: string): Promise<boolean> {
    // 1. Busca prêmios do jogo que ainda não têm dono (id_usuario IS NULL)
    // Ordena por VALOR decrescente (o maior primeiro)
    const availablePrizes = await this.prisma.pREMIOS.findMany({
      where: {
        id_jogo: gameId,
        id_usuario: null
      },
      orderBy: {
        valor: 'desc'
      }
    });

    // Se não tem prêmio, o jogo já deveria ter acabado, ou esse jogador bateu tarde demais.
    if (availablePrizes.length === 0) {
      return false; 
    }

    // 2. Pega o melhor prêmio disponível
    const prizeToGive = availablePrizes[0];

    // 3. Atribui atomicamente (para evitar race condition se dois baterem juntos)
    // Usamos updateMany com where null para garantir que ninguém pegou no meio tempo
    const result = await this.prisma.pREMIOS.updateMany({
      where: {
        id_premio: prizeToGive.id_premio,
        id_usuario: null // Garante que ainda está livre
      },
      data: {
        id_usuario: userId
      }
    });

    if (result.count > 0) {
      // Sucesso! O jogador ganhou este prêmio.
      this.logger.warn(`🏆 PRÊMIO ATRIBUÍDO: ${prizeToGive.descricao} (R$ ${prizeToGive.valor}) para ${userName}`);

      // Avisa o Frontend
      this.emitEvent(gameId, 'bingo_winner', {
        winnerName: userName,
        prize: prizeToGive.descricao,
        value: prizeToGive.valor,
        timestamp: new Date()
      });

      // 4. Verifica se ACABARAM os prêmios
      // Se availablePrizes tinha tamanho 1, agora tem 0 (pois acabamos de dar 1)
      if (availablePrizes.length === 1) {
        this.logger.log(`🏁 Todos os prêmios do Jogo ${gameId} foram distribuídos. Encerrando...`);
        this.stopGame(gameId);
        this.persistGameEnd(gameId, userId); // Grava o último vencedor como "vencedor do jogo" para fins de histórico
      }
      return true;
    }
    return false;
  }

  // --- PERSISTÊNCIA ---
  
  private async persistGameEnd(gameId: number, lastWinnerId: number) {
    try {
      // Define o jogo como encerrado (vencedor definido) para o Scheduler não reiniciar
      await this.prisma.jOGO.update({
        where: { id_jogo: gameId },
        data: { 
            id_usuario_vencedor: lastWinnerId, // Pode ser o último ganhador ou lógica personalizada
        }
      });
      this.logger.log(`✅ Jogo ${gameId} marcado como finalizado no banco.`);
    } catch (error) {
      this.logger.error(`❌ Erro ao finalizar jogo no banco: ${error.message}`);
    }
  }

  private async saveDrawnNumber(gameId: number, number: number, order: number) {
      try {
          await this.prisma.nUMEROS_SORTEADOS.create({
              data: { id_jogo: gameId, numero: number, ordem_sorteio: order }
          });
      } catch(e) {}
  }

  // --- HELPERS (Matriz, Shuffle, etc - Sem alterações) ---
  private createInitialState(): GameState {
    return { 
        numberPool: [], 
        drawnNumbers: new Set(), 
        drawInterval: null, 
        activePlayers: new Map(),
        winningCards: new Set()
    };
  }

  private checkBingo(card: number[][], drawn: Set<number>): boolean {
    const size = 5;
    const marked = card.map(row => row.map(n => n === 0 || drawn.has(n)));
    
    // Linhas
    for (let r = 0; r < size; r++) if (marked[r].every(Boolean)) return true;
    // Colunas
    for (let c = 0; c < size; c++) {
        let colOk = true;
        for(let r=0; r<size; r++) if(!marked[r][c]) colOk = false;
        if(colOk) return true;
    }
    // Diagonais
    let d1=true, d2=true;
    for(let i=0; i<size; i++) {
        if(!marked[i][i]) d1=false;
        if(!marked[i][size-1-i]) d2=false;
    }
    return d1 || d2;
  }

  private convertDbListToMatrix(numbers: number[]): number[][] {
    const matrix: number[][] = [];
    let idx = 0;
    for (let r = 0; r < 5; r++) {
      const row: number[] = [];
      for (let c = 0; c < 5; c++) {
        if (r === 2 && c === 2) row.push(0);
        else row.push(numbers[idx++] || 0);
      }
      matrix.push(row);
    }
    return matrix;
  }

  private shuffledPool(max: number) {
      const arr = Array.from({length: max}, (_, i) => i+1);
      for(let i=arr.length-1; i>0; i--){
          const j = Math.floor(Math.random()*(i+1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
  }

  private emitEvent(gameId: number, type: string, data: any) {
    this.gameEvents$.next({ gameId, type, data });
  }
}