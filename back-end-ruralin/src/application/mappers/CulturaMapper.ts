import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import Cultura from '../../models/Cultura';
import { CreateCulturaDto } from '../dto/cultura/CreateCulturaDto';
import { UpdateCulturaDto } from '../dto/cultura/UpdateCulturaDto';
import { CulturaResponseDto } from '../dto/cultura/CulturaResponseDto';

/**
 * Mapper para entidade Cultura
 */
@Injectable()
export class CulturaMapper implements IMapper<Cultura, CulturaResponseDto, CreateCulturaDto, UpdateCulturaDto> {
  async toEntity(dto: CreateCulturaDto | UpdateCulturaDto): Promise<Partial<Cultura>> {
    const entity: any = {};

    if ('descricao_clt' in dto && dto.descricao_clt !== undefined) {
      entity.descricao_clt = dto.descricao_clt;
    }
    if ('idProduto' in dto && dto.idProduto !== undefined) {
      entity.idProduto = dto.idProduto;
    }

    return entity;
  }

  toDto(entity: Cultura): CulturaResponseDto {
    const dto: CulturaResponseDto = {
      id: entity.id,
      tenantId: entity.tenantId,
      descricao_clt: entity.descricao_clt,
      idProduto: entity.idProduto,
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
}
