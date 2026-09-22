import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import Abastecimento from '../../models/Abastecimento';
import { CreateAbastecimentoDto } from '../dto/abastecimento/CreateAbastecimentoDto';
import { UpdateAbastecimentoDto } from '../dto/abastecimento/UpdateAbastecimentoDto';
import { AbastecimentoResponseDto } from '../dto/abastecimento/AbastecimentoResponseDto';
import { adicionarCamposFormatados } from '../../utils/moeda';

/**
 * Mapper para entidade Abastecimento
 */
@Injectable()
export class AbastecimentoMapper implements IMapper<Abastecimento, AbastecimentoResponseDto, CreateAbastecimentoDto, UpdateAbastecimentoDto> {
  async toEntity(dto: CreateAbastecimentoDto | UpdateAbastecimentoDto): Promise<Partial<Abastecimento>> {
    const entity: any = {};

    if ('data' in dto && dto.data !== undefined) {
      entity.data = dto.data;
    }
    if ('idMaquina' in dto && dto.idMaquina !== undefined) {
      entity.idMaquina = dto.idMaquina;
    }
    if ('kminicio' in dto && dto.kminicio !== undefined) {
      entity.kminicio = dto.kminicio;
    }
    if ('kmfim' in dto && dto.kmfim !== undefined) {
      entity.kmfim = dto.kmfim;
    }
    if ('idOperador' in dto && dto.idOperador !== undefined) {
      entity.idOperador = dto.idOperador;
    }
    if ('idCombustivel' in dto && dto.idCombustivel !== undefined) {
      entity.idCombustivel = dto.idCombustivel;
    }
    if ('volume' in dto && dto.volume !== undefined) {
      entity.volume = dto.volume;
    }
    if ('preco' in dto && dto.preco !== undefined) {
      entity.preco = dto.preco;
    }
    if ('total' in dto && dto.total !== undefined) {
      entity.total = dto.total;
    }
    if ('idFazenda' in dto && dto.idFazenda !== undefined) {
      entity.idFazenda = dto.idFazenda;
    }
    if ('idCicloAbastecimento' in dto && dto.idCicloAbastecimento !== undefined) {
      entity.idCicloAbastecimento = dto.idCicloAbastecimento;
    }
    if ('idOperadorAbastecimento' in dto && dto.idOperadorAbastecimento !== undefined) {
      entity.idOperadorAbastecimento = dto.idOperadorAbastecimento;
    }

    return entity;
  }

  toDto(entity: Abastecimento): AbastecimentoResponseDto {
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

    const dto: AbastecimentoResponseDto = {
      id_abast: entity.id_abast,
      tenantId: entity.tenantId,
      data: formatDate((entity as any).data) || entity.data,
      idMaquina: entity.idMaquina,
      kminicio: entity.kminicio != null ? Number(entity.kminicio) : 0,
      kmfim: entity.kmfim != null ? Number(entity.kmfim) : 0,
      idOperador: entity.idOperador,
      idCombustivel: entity.idCombustivel,
      volume: entity.volume != null ? Number(entity.volume) : 0,
      preco: entity.preco != null ? Number(entity.preco) : 0,
      total: entity.total != null ? Number(entity.total) : 0,
      idFazenda: entity.idFazenda,
      idCicloAbastecimento: entity.idCicloAbastecimento,
      idOperadorAbastecimento: entity.idOperadorAbastecimento,
      usercreation: entity.usercreation,
      datecreation: entity.datecreation,
    };

    // Relacionamentos condicionais
    if ((entity as any).maquina) {
      dto.maquina = {
        id_mqn: (entity as any).maquina.id_mqn,
        descricao: (entity as any).maquina.descricao,
      };
    }

    if ((entity as any).operador) {
      dto.operador = {
        id_pessoa: (entity as any).operador.id_pessoa,
        nomerazao_pessoa: (entity as any).operador.nomerazao_pessoa,
      };
    }

    if ((entity as any).combustivel) {
      dto.combustivel = {
        id_prod: (entity as any).combustivel.id_prod,
        descricao_prod: (entity as any).combustivel.descricao_prod,
      };
    }

    if ((entity as any).fazenda) {
      dto.fazenda = {
        id: (entity as any).fazenda.id,
        descricao: (entity as any).fazenda.descricao,
      };
    }

    if ((entity as any).cicloAbastecimento) {
      dto.cicloAbastecimento = {
        id: (entity as any).cicloAbastecimento.id,
        descricao: (entity as any).cicloAbastecimento.descricao,
      };
    }

    if ((entity as any).operadorAbastecimento) {
      dto.operadorAbastecimento = {
        id_pessoa: (entity as any).operadorAbastecimento.id_pessoa,
        nomerazao_pessoa: (entity as any).operadorAbastecimento.nomerazao_pessoa,
      };
    }

    if ((entity as any).usuarioCriador) {
      dto.usuarioCriador = {
        id: (entity as any).usuarioCriador.id,
        nome: (entity as any).usuarioCriador.nome,
        email: (entity as any).usuarioCriador.email,
      };
    }

    adicionarCamposFormatados(dto, ['preco', 'total']);

    return dto;
  }
}
