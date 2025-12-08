// path: src/bingo-engine/scheduler/scheduler.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { GameLogicService } from '../game-logic/game-logic.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gameLogicService: GameLogicService,
  ) {}

  // Roda a cada 30 segundos para verificar jogos
  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleCron() {
    // this.logger.debug('Verificando jogos agendados para iniciar...'); // Comentei para não poluir o log

    const now = new Date();
    // Busca jogos que deveriam ter começado e ainda não têm vencedor
    const gamesToStart = await this.prisma.jOGO.findMany({
      where: {
        data_hora: { lte: now },
        id_usuario_vencedor: null,
      },
    });

    if (gamesToStart.length > 0) {
      this.logger.log(`Encontrados ${gamesToStart.length} jogos para iniciar.`);
      
      for (const game of gamesToStart) {
        try {
          // --- CORREÇÃO AQUI ---
          // startGame agora é síncrono. Não usamos .catch() nem await.
          const result = this.gameLogicService.startGame(game.id_jogo);

          // Verificamos se o objeto retornado contém um erro
          if (result && result.error) {
            // Apenas logamos como aviso, pois pode ser que o jogo já esteja rodando (o que é normal)
            this.logger.warn(`Jogo ${game.id_jogo}: ${result.error}`);
          } else {
            this.logger.log(`Jogo ${game.id_jogo} iniciado automaticamente pelo agendador.`);
          }
        } catch (error) {
          // Captura erros inesperados que possam surgir (ex: estouro de memória)
          this.logger.error(`Exceção crítica ao tentar iniciar jogo ${game.id_jogo}: ${error.message}`);
        }
      }
    }
  }
}