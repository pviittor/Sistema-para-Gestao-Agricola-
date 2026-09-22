import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import MovimentoEstoque from '../../models/MovimentoEstoque';
import { CreateMovimentoEstoqueDto } from '../dto/movimentoEstoque/CreateMovimentoEstoqueDto';
import { UpdateMovimentoEstoqueDto } from '../dto/movimentoEstoque/UpdateMovimentoEstoqueDto';
import { MovimentoEstoqueResponseDto } from '../dto/movimentoEstoque/MovimentoEstoqueResponseDto';
import { adicionarCamposFormatados } from '../../utils/moeda';

/**
 * Mapper para entidade MovimentoEstoque
 */
@Injectable()
export class MovimentoEstoqueMapper implements IMapper<MovimentoEstoque, MovimentoEstoqueResponseDto, CreateMovimentoEstoqueDto, UpdateMovimentoEstoqueDto> {
  async toEntity(dto: CreateMovimentoEstoqueDto | UpdateMovimentoEstoqueDto): Promise<Partial<MovimentoEstoque>> {
    const entity: any = {};

    if ('idProduto' in dto && dto.idProduto !== undefined) {
      entity.idProduto = dto.idProduto;
    }
    if ('idProdutor' in dto && dto.idProdutor !== undefined) {
      entity.idProdutor = dto.idProdutor;
    }
    if ('idFazenda' in dto && dto.idFazenda !== undefined) {
      entity.idFazenda = dto.idFazenda;
    }
    if ('idAbastecimento' in dto && dto.idAbastecimento !== undefined) {
      entity.idAbastecimento = dto.idAbastecimento;
    }
    if ('tipomov' in dto && dto.tipomov !== undefined) {
      entity.tipomov = dto.tipomov;
    }
    if ('operacao' in dto && dto.operacao !== undefined) {
      entity.operacao = dto.operacao;
    }
    if ('quantidade' in dto && dto.quantidade !== undefined) {
      entity.quantidade = dto.quantidade;
    }
    if ('data' in dto && dto.data !== undefined) {
      entity.data = dto.data;
    }
    if ('valor' in dto && dto.valor !== undefined) {
      entity.valor = dto.valor;
    }

    return entity;
  }

  toDto(entity: MovimentoEstoque): MovimentoEstoqueResponseDto {
    const formatDate = (date: Date | string | null | undefined): string | null => {
      if (!date) return null;
      if (typeof date === 'string') {
        try {
          const d = new Date(date);
          return d.toISOString().split('T')[0];
        } catch (e) {
          return date.split('T')[0];
        }
      }
      if (date instanceof Date) {
        return date.toISOString().split('T')[0];
      }
      return null;
    };

    const dto: MovimentoEstoqueResponseDto = {
      id_mov: entity.id_mov,
      tenantId: entity.tenantId,
      idProduto: entity.idProduto,
      idProdutor: entity.idProdutor,
      idFazenda: entity.idFazenda,
      idAbastecimento: entity.idAbastecimento,
      tipomov: entity.tipomov,
      operacao: entity.operacao,
      quantidade: entity.quantidade != null ? Number(entity.quantidade) : 0,
      data: formatDate((entity as any).data) || entity.data,
      valor: entity.valor != null ? Number(entity.valor) : 0,
      usercreation: entity.usercreation,
      datecreation: entity.datecreation,
    };

    // Relacionamentos condicionais
    if ((entity as any).produto) {
      dto.produto = {
        id_prod: (entity as any).produto.id_prod,
        descricao_prod: (entity as any).produto.descricao_prod,
      };
    }

    if ((entity as any).produtor) {
      dto.produtor = {
        id_pessoa: (entity as any).produtor.id_pessoa,
        nomerazao_pessoa: (entity as any).produtor.nomerazao_pessoa,
      };
    }

    if ((entity as any).fazenda) {
      dto.fazenda = {
        id: (entity as any).fazenda.id,
        descricao: (entity as any).fazenda.descricao,
      };
    }

    if ((entity as any).abastecimento) {
      dto.abastecimento = {
        id_abast: (entity as any).abastecimento.id_abast,
        data: (entity as any).abastecimento.data,
      };
    }

    if ((entity as any).usuarioCriador) {
      dto.usuarioCriador = {
        id: (entity as any).usuarioCriador.id,
        nome: (entity as any).usuarioCriador.nome,
        email: (entity as any).usuarioCriador.email,
      };
    }

    adicionarCamposFormatados(dto, ['valor']);

    return dto;
  }
}
