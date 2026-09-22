import { Injectable } from '../../core/di';
import HistoricoPreco from '../../models/HistoricoPreco';
import { HistoricoPrecoResponseDto } from '../dto/historicoPreco/HistoricoPrecoResponseDto';
import { adicionarCamposFormatados } from '../../utils/moeda';

/**
 * Mapper para entidade HistoricoPreco
 *
 * Apenas toDto (criação de entidade é interna via service)
 */
@Injectable()
export class HistoricoPrecoMapper {
  toDto(entity: HistoricoPreco): HistoricoPrecoResponseDto {
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

    const dto: HistoricoPrecoResponseDto = {
      id_hist: entity.id_hist,
      tenantId: entity.tenantId,
      idProduto: entity.idProduto,
      idFazenda: entity.idFazenda,
      idMovimentoEstoque: entity.idMovimentoEstoque,
      preco: entity.preco != null ? Number(entity.preco) : 0,
      quantidade: entity.quantidade != null ? Number(entity.quantidade) : 0,
      data: formatDate((entity as any).data) || entity.data,
      idMoeda: entity.idMoeda,
      valorMoedaPadrao: entity.valorMoedaPadrao != null ? Number(entity.valorMoedaPadrao) : 0,
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

    if ((entity as any).fazenda) {
      dto.fazenda = {
        id: (entity as any).fazenda.id,
        descricao: (entity as any).fazenda.descricao,
      };
    }

    if ((entity as any).moeda) {
      dto.moeda = {
        id_moeda: (entity as any).moeda.id_moeda,
        descricao: (entity as any).moeda.descricao,
      };
    }

    adicionarCamposFormatados(dto, ['preco', 'valorMoedaPadrao']);

    return dto;
  }
}
