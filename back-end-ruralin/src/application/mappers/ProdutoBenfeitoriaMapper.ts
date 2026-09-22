import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import ProdutoBenfeitoria from '../../models/ProdutoBenfeitoria';
import { CreateProdutoBenfeitoriaDto } from '../dto/produtoBenfeitoria/CreateProdutoBenfeitoriaDto';
import { UpdateProdutoBenfeitoriaDto } from '../dto/produtoBenfeitoria/UpdateProdutoBenfeitoriaDto';
import { ProdutoBenfeitoriaResponseDto } from '../dto/produtoBenfeitoria/ProdutoBenfeitoriaResponseDto';
import { adicionarCamposFormatados } from '../../utils/moeda';

/**
 * Mapper para entidade ProdutoBenfeitoria
 */
@Injectable()
export class ProdutoBenfeitoriaMapper implements IMapper<ProdutoBenfeitoria, ProdutoBenfeitoriaResponseDto, CreateProdutoBenfeitoriaDto, UpdateProdutoBenfeitoriaDto> {
  async toEntity(dto: CreateProdutoBenfeitoriaDto | UpdateProdutoBenfeitoriaDto): Promise<Partial<ProdutoBenfeitoria>> {
    const entity: any = {};

    if ('idBenfeitoria' in dto && dto.idBenfeitoria !== undefined) {
      entity.idBenfeitoria = dto.idBenfeitoria;
    }
    if ('idProduto' in dto && dto.idProduto !== undefined) {
      entity.idProduto = dto.idProduto;
    }
    if ('data' in dto && dto.data !== undefined) {
      entity.data = dto.data;
    }
    if ('quantidade' in dto && dto.quantidade !== undefined) {
      entity.quantidade = dto.quantidade;
    }
    if ('unitario' in dto && dto.unitario !== undefined) {
      entity.unitario = dto.unitario;
    }
    if ('observacao' in dto && dto.observacao !== undefined) {
      entity.observacao = dto.observacao;
    }
    if ('idSafra' in dto && dto.idSafra !== undefined) {
      entity.idSafra = dto.idSafra;
    }

    return entity;
  }

  toDto(entity: ProdutoBenfeitoria): ProdutoBenfeitoriaResponseDto {
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

    const dto: ProdutoBenfeitoriaResponseDto = {
      id_prodbenf: entity.id_prodbenf,
      tenantId: entity.tenantId,
      idBenfeitoria: entity.idBenfeitoria,
      idProduto: entity.idProduto,
      data: formatDate((entity as any).data) || entity.data,
      quantidade: entity.quantidade != null ? Number(entity.quantidade) : 0,
      unitario: entity.unitario != null ? Number(entity.unitario) : 0,
      observacao: entity.observacao,
      idSafra: entity.idSafra,
      usercreation: entity.usercreation,
      datecreation: entity.datecreation,
    };

    // Relacionamentos condicionais
    if ((entity as any).benfeitoria) {
      dto.benfeitoria = {
        id_benf: (entity as any).benfeitoria.id_benf,
        descricao: (entity as any).benfeitoria.descricao,
      };
    }

    if ((entity as any).produto) {
      dto.produto = {
        id_prod: (entity as any).produto.id_prod,
        descricao: (entity as any).produto.descricao,
      };
    }

    if ((entity as any).safra) {
      dto.safra = {
        id: (entity as any).safra.id,
        descricao: (entity as any).safra.descricao,
      };
    }

    if ((entity as any).usuarioCriador) {
      dto.usuarioCriador = {
        id: (entity as any).usuarioCriador.id,
        nome: (entity as any).usuarioCriador.nome,
        email: (entity as any).usuarioCriador.email,
      };
    }

    adicionarCamposFormatados(dto, ['unitario']);

    return dto;
  }
}
