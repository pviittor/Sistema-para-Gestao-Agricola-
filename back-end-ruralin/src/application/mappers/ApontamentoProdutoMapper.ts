import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import ApontamentoProduto from '../../models/ApontamentoProduto';
import { CreateApontamentoProdutoDto } from '../dto/apontamentoProduto/CreateApontamentoProdutoDto';
import { UpdateApontamentoProdutoDto } from '../dto/apontamentoProduto/UpdateApontamentoProdutoDto';
import { ApontamentoProdutoResponseDto } from '../dto/apontamentoProduto/ApontamentoProdutoResponseDto';
import { adicionarCamposFormatados } from '../../utils/moeda';

/**
 * Mapper para entidade ApontamentoProduto
 */
@Injectable()
export class ApontamentoProdutoMapper implements IMapper<ApontamentoProduto, ApontamentoProdutoResponseDto, CreateApontamentoProdutoDto, UpdateApontamentoProdutoDto> {
  async toEntity(dto: CreateApontamentoProdutoDto | UpdateApontamentoProdutoDto): Promise<Partial<ApontamentoProduto>> {
    const entity: any = {};

    if ('idApontamento' in dto && dto.idApontamento !== undefined) {
      entity.idApontamento = dto.idApontamento;
    }
    if ('idProduto' in dto && dto.idProduto !== undefined) {
      entity.idProduto = dto.idProduto;
    }
    if ('quantidade' in dto && dto.quantidade !== undefined) {
      entity.quantidade = dto.quantidade;
    }
    if ('valor' in dto && dto.valor !== undefined) {
      entity.valor = dto.valor;
    }
    if ('temperatura' in dto && dto.temperatura !== undefined) {
      entity.temperatura = dto.temperatura;
    }
    if ('umidade' in dto && dto.umidade !== undefined) {
      entity.umidade = dto.umidade;
    }
    if ('periodo' in dto && dto.periodo !== undefined) {
      entity.periodo = dto.periodo;
    }
    if ('data' in dto && dto.data !== undefined) {
      entity.data = dto.data;
    }
    if ('numero' in dto && dto.numero !== undefined) {
      entity.numero = dto.numero;
    }
    if ('observacao' in dto && dto.observacao !== undefined) {
      entity.observacao = dto.observacao;
    }
    if ('area' in dto && dto.area !== undefined) {
      entity.area = dto.area;
    }
    if ('dosagem' in dto && dto.dosagem !== undefined) {
      entity.dosagem = dto.dosagem;
    }
    if ('produtoConvertidoMoeda' in dto && dto.produtoConvertidoMoeda !== undefined) {
      entity.produtoConvertidoMoeda = dto.produtoConvertidoMoeda;
    }

    return entity;
  }

  toDto(entity: ApontamentoProduto): ApontamentoProdutoResponseDto {
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

    const dto: ApontamentoProdutoResponseDto = {
      id_aptprod: entity.id_aptprod,
      tenantId: entity.tenantId,
      idApontamento: entity.idApontamento,
      idProduto: entity.idProduto,
      quantidade: entity.quantidade != null ? Number(entity.quantidade) : 0,
      valor: entity.valor != null ? Number(entity.valor) : 0,
      temperatura: entity.temperatura != null ? Number(entity.temperatura) : 0,
      umidade: entity.umidade != null ? Number(entity.umidade) : 0,
      periodo: entity.periodo,
      data: formatDate((entity as any).data) || entity.data,
      numero: entity.numero,
      observacao: entity.observacao,
      area: entity.area != null ? Number(entity.area) : 0,
      dosagem: entity.dosagem != null ? Number(entity.dosagem) : 0,
      produtoConvertidoMoeda: entity.produtoConvertidoMoeda,
      usercreation: entity.usercreation,
      datecreation: entity.datecreation,
    };

    // Relacionamentos condicionais
    if ((entity as any).apontamento) {
      dto.apontamento = {
        id_apt: (entity as any).apontamento.id_apt,
      };
    }

    if ((entity as any).produto) {
      dto.produto = {
        id_prod: (entity as any).produto.id_prod,
        descricao_prod: (entity as any).produto.descricao_prod,
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
