import { Injectable } from '../../core/di';
import TipoAtividadeOS from '../../models/TipoAtividadeOS';
import { CreateTipoAtividadeOSDto } from '../dto/tipoAtividadeOS/CreateTipoAtividadeOSDto';
import { UpdateTipoAtividadeOSDto } from '../dto/tipoAtividadeOS/UpdateTipoAtividadeOSDto';
import { TipoAtividadeOSResponseDto, CampoCondicionalResponseDto } from '../dto/tipoAtividadeOS/TipoAtividadeOSResponseDto';

/**
 * TipoAtividadeOSMapper - Mapper para entidade TipoAtividadeOS
 *
 * Responsável por converter entre DTOs e entidades do domínio para TipoAtividadeOS.
 * Inclui mapeamento nested de camposCondicionais.
 */
@Injectable()
export class TipoAtividadeOSMapper {
  /**
   * Converte entidade do domínio para DTO de resposta
   *
   * @param entity - Entidade TipoAtividadeOS (pode incluir camposCondicionais via Sequelize include)
   * @returns DTO de resposta com campos e array de camposCondicionais
   */
  toDto(entity: TipoAtividadeOS): TipoAtividadeOSResponseDto {
    const dto: TipoAtividadeOSResponseDto = {
      id: entity.id,
      tenantId: entity.tenantId,
      nome: entity.nome,
      descricao: entity.descricao ?? null,
      categoria: entity.categoria,
      icone: entity.icone ?? null,
      cor: entity.cor ?? null,
      ativo: entity.ativo,
      planoContaIdPadrao: entity.planoContaIdPadrao ?? null,
      centroCustoIdPadrao: entity.centroCustoIdPadrao ?? null,
      camposCondicionais: [],
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };

    // Mapear camposCondicionais quando disponíveis (via Sequelize include)
    if ((entity as any).camposCondicionais && Array.isArray((entity as any).camposCondicionais)) {
      dto.camposCondicionais = (entity as any).camposCondicionais.map((campo: any): CampoCondicionalResponseDto => ({
        id: campo.id,
        nomeCampo: campo.nomeCampo,
        rotulo: campo.rotulo,
        tipoCampo: campo.tipoCampo,
        obrigatorio: campo.obrigatorio ?? false,
        opcoes: campo.opcoes ?? null,
        unidade: campo.unidade ?? null,
        ordem: campo.ordem,
        ativo: campo.ativo ?? true,
      }));
    }

    return dto;
  }

  /**
   * Converte DTO para atributos da entidade
   *
   * @param dto - DTO de criação ou atualização
   * @returns Atributos parciais da entidade
   */
  toEntity(dto: CreateTipoAtividadeOSDto | UpdateTipoAtividadeOSDto | any): Partial<TipoAtividadeOS> {
    const entity: any = {};

    if ('nome' in dto && dto.nome !== undefined) entity.nome = dto.nome;
    if ('descricao' in dto && dto.descricao !== undefined) entity.descricao = dto.descricao;
    if ('categoria' in dto && dto.categoria !== undefined) entity.categoria = dto.categoria;
    if ('icone' in dto && dto.icone !== undefined) entity.icone = dto.icone;
    if ('cor' in dto && dto.cor !== undefined) entity.cor = dto.cor;
    if ('ativo' in dto && dto.ativo !== undefined) entity.ativo = dto.ativo;
    if ('planoContaIdPadrao' in dto && dto.planoContaIdPadrao !== undefined) entity.planoContaIdPadrao = dto.planoContaIdPadrao;
    if ('centroCustoIdPadrao' in dto && dto.centroCustoIdPadrao !== undefined) entity.centroCustoIdPadrao = dto.centroCustoIdPadrao;

    return entity;
  }
}
