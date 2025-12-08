import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { CreatePrizeDto } from './dto/create-prize.dto';
import { UpdatePrizeDto } from './dto/update-prize.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrizesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPrizeDto: CreatePrizeDto) {
    const { id_jogo } = createPrizeDto;

    // Verifica se o jogo existe
    const game = await this.prisma.jOGO.findUnique({
      where: { id_jogo },
    });

    if (!game) {
      throw new NotFoundException(`Jogo com ID ${id_jogo} não encontrado.`);
    }

    // Cria os dados para o Prisma (sem id_usuario)
    const data: Prisma.PREMIOSCreateInput = {
      descricao: createPrizeDto.descricao,
      valor: new Prisma.Decimal(createPrizeDto.valor),
      JOGO: {
        connect: { id_jogo },
      },
      // id_usuario foi removido daqui propositalmente
    };

    return this.prisma.pREMIOS.create({
      data,
      include: {
        JOGO: {
          select: {
            id_jogo: true,
            data_hora: true,
          },
        },
        // Não incluímos USUARIO aqui pois nasce nulo
      },
    });
  }

  findAll() {
    return this.prisma.pREMIOS.findMany({
      include: {
        JOGO: {
          select: {
            id_jogo: true,
            SALA: { select: { nome: true } }
          }
        },
        USUARIO: {
          select: {
            id_usuario: true,
            nome: true,
            email: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const prize = await this.prisma.pREMIOS.findUnique({
      where: { id_premio: id },
      include: {
        JOGO: true,
        USUARIO: {
          select: {
            id_usuario: true,
            nome: true,
          },
        },
      },
    });

    if (!prize) {
      throw new NotFoundException(`Prêmio com ID ${id} não encontrado.`);
    }

    return prize;
  }

  async update(id: number, updatePrizeDto: UpdatePrizeDto) {
    await this.findOne(id); // Garante que existe

    const data: Prisma.PREMIOSUpdateInput = {};

    if (updatePrizeDto.descricao) {
      data.descricao = updatePrizeDto.descricao;
    }

    if (updatePrizeDto.valor) {
      data.valor = new Prisma.Decimal(updatePrizeDto.valor);
    }

    // Nota: Não permitimos atualizar o Jogo ou Usuário manualmente aqui.
    // O usuário é definido pela lógica do Bingo.

    return this.prisma.pREMIOS.update({
      where: { id_premio: id },
      data,
      include: {
        USUARIO: { select: { nome: true } }
      }
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.pREMIOS.delete({
      where: { id_premio: id },
    });
  }
}