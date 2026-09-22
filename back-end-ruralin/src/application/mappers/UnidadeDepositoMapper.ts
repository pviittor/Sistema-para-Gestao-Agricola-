import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import UnidadeDeposito from '../../models/UnidadeDeposito';
import { CreateUnidadeDepositoDto } from '../dto/unidadeDeposito/CreateUnidadeDepositoDto';
import { UpdateUnidadeDepositoDto } from '../dto/unidadeDeposito/UpdateUnidadeDepositoDto';
import { UnidadeDepositoResponseDto } from '../dto/unidadeDeposito/UnidadeDepositoResponseDto';
import { UnidadeDepositoComSaldoDto } from '../dto/unidadeDeposito/UnidadeDepositoComSaldoDto';

/**
 * Mapper para entidade UnidadeDeposito
 */
@Injectable()
export class UnidadeDepositoMapper implements IMapper<UnidadeDeposito, UnidadeDepositoResponseDto, CreateUnidadeDepositoDto, UpdateUnidadeDepositoDto> {
  async toEntity(dto: CreateUnidadeDepositoDto | UpdateUnidadeDepositoDto): Promise<Partial<UnidadeDeposito>> {
    const entity: any = {};

    if ('descricao' in dto && dto.descricao !== undefined) {
      entity.descricao = dto.descricao;
    }
    if ('tipo' in dto && dto.tipo !== undefined) {
      entity.tipo = dto.tipo;
    }
    if ('capacidade_total' in dto && dto.capacidade_total !== undefined) {
      entity.capacidade_total = dto.capacidade_total;
    }
    if ('idUnidadeMedida' in dto && dto.idUnidadeMedida !== undefined) {
      entity.idUnidadeMedida = dto.idUnidadeMedida;
    }
    if ('idProduto' in dto && dto.idProduto !== undefined) {
      entity.idProduto = dto.idProduto;
    }
    if ('saldo_inicial' in dto && dto.saldo_inicial !== undefined) {
      entity.saldo_inicial = dto.saldo_inicial;
    }
    if ('ativo' in dto && dto.ativo !== undefined) {
      entity.ativo = dto.ativo;
    }

    return entity;
  }

  toDto(entity: UnidadeDeposito): UnidadeDepositoResponseDto {
    const dto: UnidadeDepositoResponseDto = {
      id: entity.id,
      tenantId: entity.tenantId,
      descricao: entity.descricao,
      tipo: entity.tipo,
      capacidade_total: Number(entity.capacidade_total),
      idUnidadeMedida: entity.idUnidadeMedida,
      idProduto: entity.idProduto,
      saldo_inicial: Number(entity.saldo_inicial),
      ativo: entity.ativo,
      usercreation: entity.usercreation,
      datecreation: entity.datecreation,
    };

    if ((entity as any).usuarioCriador) {
      dto.usuarioCriador = {
        id: (entity as any).usuarioCriador.id,
        nome: (entity as any).usuarioCriador.nome,
        email: (entity as any).usuarioCriador.email,
      };
    }

    if ((entity as any).unidadeMedida) {
      dto.unidadeMedida = {
        id_unidade: (entity as any).unidadeMedida.id_unidade,
        descricao_unidade: (entity as any).unidadeMedida.descricao_unidade,
        abreviatura_unidade: (entity as any).unidadeMedida.abreviatura_unidade,
      };
    }

    if ((entity as any).produto) {
      dto.produto = {
        id_prod: (entity as any).produto.id_prod,
        descricao_prod: (entity as any).produto.descricao_prod,
        idGrupo: (entity as any).produto.idGrupo,
        idSubGrupo: (entity as any).produto.idSubGrupo,
      };
    }

    return dto;
  }

  /**
   * Mapeia para DTO com saldo calculado
   */
  toComSaldoDto(raw: any): UnidadeDepositoComSaldoDto {
    const dto: UnidadeDepositoComSaldoDto = {
      id: raw.id,
      tenantId: raw.tenantId,
      descricao: raw.descricao,
      tipo: raw.tipo,
      capacidade_total: Number(raw.capacidade_total),
      idUnidadeMedida: raw.idUnidadeMedida,
      idProduto: raw.idProduto,
      saldo_inicial: Number(raw.saldo_inicial),
      ativo: raw.ativo === 1 || raw.ativo === true,
      usercreation: raw.usercreation,
      datecreation: raw.datecreation,
      saldoAtual: Number(raw.saldoAtual) || 0,
      percentualUtilizado: Number(raw.percentualUtilizado) || 0,
    };

    if (raw.descricao_unidade) {
      dto.unidadeMedida = {
        id_unidade: raw.idUnidadeMedida,
        descricao_unidade: raw.descricao_unidade,
        abreviatura_unidade: raw.abreviatura_unidade,
      };
    }

    if (raw.descricao_prod) {
      dto.produto = {
        id_prod: raw.idProduto,
        descricao_prod: raw.descricao_prod,
      };
    }

    if (raw.nome_usuario) {
      dto.usuarioCriador = {
        id: raw.usercreation,
        nome: raw.nome_usuario,
        email: '',
      };
    }

    return dto;
  }
}
