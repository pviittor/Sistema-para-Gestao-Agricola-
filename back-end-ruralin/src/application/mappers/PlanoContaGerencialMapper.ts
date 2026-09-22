import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import PlanoContaGerencial from '../../models/PlanoContaGerencial';
import { CreatePlanoContaGerencialDto } from '../dto/planoContaGerencial/CreatePlanoContaGerencialDto';
import { UpdatePlanoContaGerencialDto } from '../dto/planoContaGerencial/UpdatePlanoContaGerencialDto';
import { PlanoContaGerencialResponseDto } from '../dto/planoContaGerencial/PlanoContaGerencialResponseDto';

/**
 * Mapper para entidade PlanoContaGerencial
 */
@Injectable()
export class PlanoContaGerencialMapper
  implements IMapper<PlanoContaGerencial, PlanoContaGerencialResponseDto, CreatePlanoContaGerencialDto, UpdatePlanoContaGerencialDto>
{
  async toEntity(dto: CreatePlanoContaGerencialDto | UpdatePlanoContaGerencialDto): Promise<Partial<PlanoContaGerencial>> {
    const entity: any = {};

    if ('item' in dto && dto.item !== undefined) {
      entity.item = dto.item;
    }
    if ('descricao' in dto && dto.descricao !== undefined) {
      entity.descricao = dto.descricao;
    }
    if ('tipo' in dto && dto.tipo !== undefined) {
      entity.tipo = dto.tipo;
    }
    if ('tipoFluxo' in dto && dto.tipoFluxo !== undefined) {
      entity.tipoFluxo = dto.tipoFluxo;
    }
    if ('classificacao' in dto && dto.classificacao !== undefined) {
      entity.classificacao = dto.classificacao;
    }
    if ('contaPaiId' in dto && dto.contaPaiId !== undefined) {
      entity.contaPaiId = dto.contaPaiId;
    }
    if ('nivel' in dto && dto.nivel !== undefined) {
      entity.nivel = dto.nivel;
    }
    if ('ativo' in dto && dto.ativo !== undefined) {
      entity.ativo = dto.ativo;
    }

    return entity;
  }

  toDto(entity: PlanoContaGerencial): PlanoContaGerencialResponseDto {
    const dto: PlanoContaGerencialResponseDto = {
      id: entity.id,
      tenantId: entity.tenantId,
      item: entity.item,
      descricao: entity.descricao,
      tipo: entity.tipo,
      tipoFluxo: entity.tipoFluxo,
      classificacao: entity.classificacao,
      contaPaiId: entity.contaPaiId,
      nivel: entity.nivel,
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

    if ((entity as any).contaPai) {
      dto.contaPai = {
        id: (entity as any).contaPai.id,
        item: (entity as any).contaPai.item,
        descricao: (entity as any).contaPai.descricao,
        tipo: (entity as any).contaPai.tipo,
        tipoFluxo: (entity as any).contaPai.tipoFluxo,
        nivel: (entity as any).contaPai.nivel,
      };
    }

    if ((entity as any).contasFilhas && Array.isArray((entity as any).contasFilhas)) {
      dto.contasFilhas = (entity as any).contasFilhas.map((filha: PlanoContaGerencial) => this.toDto(filha));
    }

    return dto;
  }
}
