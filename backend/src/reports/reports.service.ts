import { Injectable } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async relatorio1(user: { sub: number; isAdmin: boolean }, targetUserId?: number) {
    // Se for admin, vê tudo ou filtra por usuário. Se for usuário comum, vê apenas seus jogos.
    let whereClause: any = {};

    if (user.isAdmin) {
      // Admin
      if (targetUserId) {
        // Admin pesquisando usuário específico
        whereClause = { CARTELA: { some: { id_usuario: targetUserId } } };
      } else {
        // Admin vendo global (sem filtro)
        whereClause = {};
      }
    } else {
      // Usuário Comum
      if (targetUserId && targetUserId !== user.sub) {
        // Tentando ver outro usuário -> Proibido
        // (Opcional: lançar erro ou ignorar e mostrar o dele. Vamos lançar erro para ser claro)
        throw new Error('Você não tem permissão para ver relatórios de outros usuários.');
      }
      // Mostra apenas os jogos dele
      whereClause = { CARTELA: { some: { id_usuario: user.sub } } };
    }

    const jogos = await this.prisma.jOGO.findMany({
      where: whereClause,
      select: {
        id_jogo: true,
        data_hora: true,
        SALA: { select: { id_sala: true, nome: true } },
        preco_cartela: true,
      },
      orderBy: { data_hora: 'desc' },
      take: 50, // Limita a 50 para não ficar gigante
    });

    // Agrupa por hora do dia (0-23)
    const countPorHora: Record<number, number> = {};
    for (const j of jogos) {
      const hora = new Date(j.data_hora).getHours();
      countPorHora[hora] = (countPorHora[hora] || 0) + 1;
    }
    
    // Determina horário mais jogado
    let horarioMaisJogado: { hora: number; partidas: number } | null = null;
    Object.entries(countPorHora).forEach(([h, c]) => {
      const hora = parseInt(h, 10);
      if (!horarioMaisJogado || c > horarioMaisJogado.partidas) {
        horarioMaisJogado = { hora, partidas: c };
      }
    });

    // Cálculo da Taxa de Vitória (apenas se estiver filtrando por usuário)
    let taxaVitoria: number | null = null;
    const userIdForStats = (!user.isAdmin) ? user.sub : (targetUserId || null);

    if (userIdForStats) {
      const totalParticipacoes = await this.prisma.jOGO.count({
        where: { CARTELA: { some: { id_usuario: userIdForStats } } }
      });

      const totalVitorias = await this.prisma.jOGO.count({
        where: { id_usuario_vencedor: userIdForStats }
      });

      if (totalParticipacoes > 0) {
        taxaVitoria = (totalVitorias / totalParticipacoes) * 100;
      } else {
        taxaVitoria = 0;
      }
    }

    return {
      titulo: !user.isAdmin ? 'Meus Jogos' : (targetUserId ? `Relatório do Usuário ${targetUserId}` : 'Resumo Global do Sistema'),
      geradoEm: new Date().toISOString(),
      resumo: horarioMaisJogado
        ? {
            hora: horarioMaisJogado.hora,
            partidasNesseHorario: horarioMaisJogado.partidas,
            totalPartidas: jogos.length,
            taxaVitoria: taxaVitoria,
          }
        : {
            hora: null,
            partidasNesseHorario: 0,
            totalPartidas: jogos.length,
            taxaVitoria: taxaVitoria,
          },
      jogos: jogos.map((j) => ({
        id: j.id_jogo,
        dataHora: j.data_hora,
        sala: j.SALA?.nome,
        precoCartela: j.preco_cartela ? Number(j.preco_cartela) : 0,
      })),
    };
  }

  async relatorio2() {
    // Relatório de Métricas por Sala (conforme esperado pelo frontend)
    const salas = await this.prisma.sALA.findMany({
      include: {
        JOGO: {
          include: {
            CARTELA: true
          }
        }
      }
    });

    const hoje = new Date();
    hoje.setHours(0,0,0,0);

    const metricas = salas.map(sala => {
      // Jogadores únicos que já jogaram nesta sala
      const jogadoresUnicos = new Set<number>();
      let jogosHoje = 0;

      sala.JOGO.forEach(jogo => {
        // Contar jogos de hoje
        const dataJogo = new Date(jogo.data_hora);
        dataJogo.setHours(0,0,0,0);
        if (dataJogo.getTime() === hoje.getTime()) {
          jogosHoje++;
        }

        // Coletar IDs de usuários
        jogo.CARTELA.forEach(cartela => {
          if (cartela.id_usuario) jogadoresUnicos.add(cartela.id_usuario);
        });
      });

      return {
        id: sala.id_sala,
        nome: sala.nome,
        jogadores: jogadoresUnicos.size,
        jogosHoje: jogosHoje
      };
    });

    return {
      titulo: 'Métricas por Sala',
      geradoEm: new Date().toISOString(),
      salas: metricas
    };
  }

  async seedExemplo() {
    // Cria alguns usuários
    const u1 = await this.prisma.uSUARIO.upsert({
      where: { email: 'alice@example.com' },
      update: {},
      create: {
        nome: 'Alice',
        email: 'alice@example.com',
        senha: 'hash',
        creditos: 100,
        is_admin: false,
      },
    });
    const u2 = await this.prisma.uSUARIO.upsert({
      where: { email: 'bob@example.com' },
      update: {},
      create: {
        nome: 'Bob',
        email: 'bob@example.com',
        senha: 'hash',
        creditos: 200,
        is_admin: false,
      },
    });

    // Cria salas
    const salaA = await this.prisma.sALA.upsert({
      where: { id_sala: 1 },
      update: { nome: 'Sala A' },
      create: { nome: 'Sala A', descricao: 'Sala de testes' },
    });
    const salaB = await this.prisma.sALA.upsert({
      where: { id_sala: 2 },
      update: { nome: 'Sala B' },
      create: { nome: 'Sala B', descricao: 'Outra sala de testes' },
    });

    // Cria jogos em horários diferentes
    const agora = new Date();
    const j1 = await this.prisma.jOGO.create({
      data: {
        data_hora: new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 20, 0, 0),
        id_sala: salaA.id_sala,
        preco_cartela: 5,
      },
    });
    const j2 = await this.prisma.jOGO.create({
      data: {
        data_hora: new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 20, 30, 0),
        id_sala: salaA.id_sala,
        preco_cartela: 5,
      },
    });
    const j3 = await this.prisma.jOGO.create({
      data: {
        data_hora: new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 15, 0, 0),
        id_sala: salaB.id_sala,
        preco_cartela: 10,
      },
    });

    // Cartelas dos usuários para esses jogos
    await this.prisma.cARTELA.createMany({
      data: [
        { id_usuario: u1.id_usuario, id_jogo: j1.id_jogo },
        { id_usuario: u1.id_usuario, id_jogo: j2.id_jogo },
        { id_usuario: u1.id_usuario, id_jogo: j3.id_jogo },
        { id_usuario: u2.id_usuario, id_jogo: j1.id_jogo },
      ],
    });

    // Prêmios para ranking
    await this.prisma.pREMIOS.createMany({
      data: [
        { descricao: 'Linha', valor: 50, id_usuario: u1.id_usuario, id_jogo: j1.id_jogo },
        { descricao: 'Cartela Cheia', valor: 200, id_usuario: u1.id_usuario, id_jogo: j2.id_jogo },
        { descricao: 'Linha', valor: 30, id_usuario: u2.id_usuario, id_jogo: j1.id_jogo },
      ],
    });

    return { ok: true };
  }
}
