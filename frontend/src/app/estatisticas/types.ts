export type ReportResult<T = unknown> = {
  ok: boolean;
  status: number;
  data: T | string | null;
  error?: string;
};

export type Relatorio1 = {
  titulo: string;
  geradoEm: string;
  resumo: {
    usuarioId: number | null;
    hora: number | null;
    partidasNesseHorario: number;
    totalPartidas: number;
    taxaVitoria?: number | null;
  };
  jogos: {
    id: number;
    dataHora: string;
    sala: string;
    precoCartela: number;
  }[];
  mensagem?: string;
};

export type SalaMetricas = {
  id: number;
  nome: string;
  jogadores: number;
  jogosHoje: number;
};

export type Relatorio2 = {
  titulo: string;
  geradoEm: string;
  salas: SalaMetricas[];
};
