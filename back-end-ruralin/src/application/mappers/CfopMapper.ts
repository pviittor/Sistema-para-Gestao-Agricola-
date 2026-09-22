import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import Cfop from '../../models/Cfop';
import { CreateCfopDto } from '../dto/cfop/CreateCfopDto';
import { UpdateCfopDto } from '../dto/cfop/UpdateCfopDto';
import { CfopResponseDto } from '../dto/cfop/CfopResponseDto';

/**
 * Mapper para entidade Cfop
 *
 * Converte entre DTOs e entidade Sequelize.
 * CFOP é uma entidade global (sem tenant).
 */
@Injectable()
export class CfopMapper implements IMapper<Cfop, CfopResponseDto, CreateCfopDto, UpdateCfopDto> {
  /**
   * Converte DTO para entidade do domínio
   */
  async toEntity(dto: CreateCfopDto | UpdateCfopDto): Promise<Partial<Cfop>> {
    const entity: any = {};

    if ('codigo' in dto && dto.codigo !== undefined) {
      entity.codigo = dto.codigo;
    }
    if ('descricao' in dto && dto.descricao !== undefined) {
      entity.descricao = dto.descricao;
    }
    if ('natureza' in dto && dto.natureza !== undefined) {
      entity.natureza = dto.natureza;
    }
    if ('tipo_operacao' in dto && dto.tipo_operacao !== undefined) {
      entity.tipo_operacao = dto.tipo_operacao;
    }
    if ('gera_financeiro' in dto && dto.gera_financeiro !== undefined) {
      entity.gera_financeiro = dto.gera_financeiro;
    }
    if ('movimenta_estoque' in dto && dto.movimenta_estoque !== undefined) {
      entity.movimenta_estoque = dto.movimenta_estoque;
    }
    if ('aplicacao_ipi' in dto && dto.aplicacao_ipi !== undefined) {
      entity.aplicacao_ipi = dto.aplicacao_ipi;
    }
    if ('aplicacao_icms' in dto && dto.aplicacao_icms !== undefined) {
      entity.aplicacao_icms = dto.aplicacao_icms;
    }
    if ('aplicacao_pis_cofins' in dto && dto.aplicacao_pis_cofins !== undefined) {
      entity.aplicacao_pis_cofins = dto.aplicacao_pis_cofins;
    }
    if ('ativo' in dto && dto.ativo !== undefined) {
      entity.ativo = dto.ativo;
    }

    return entity;
  }

  /**
   * Converte entidade para DTO de resposta
   */
  toDto(entity: Cfop): CfopResponseDto {
    const dto: CfopResponseDto = {
      id: entity.id,
      codigo: entity.codigo,
      descricao: entity.descricao,
      natureza: entity.natureza,
      tipo_operacao: entity.tipo_operacao,
      gera_financeiro: entity.gera_financeiro,
      movimenta_estoque: entity.movimenta_estoque,
      aplicacao_ipi: entity.aplicacao_ipi,
      aplicacao_icms: entity.aplicacao_icms,
      aplicacao_pis_cofins: entity.aplicacao_pis_cofins,
      ativo: entity.ativo,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };

    return dto;
  }
}
