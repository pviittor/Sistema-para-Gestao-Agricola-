import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import Produto from '../../models/Produto';
import { CreateProdutoDto } from '../dto/produto/CreateProdutoDto';
import { UpdateProdutoDto } from '../dto/produto/UpdateProdutoDto';
import { ProdutoResponseDto } from '../dto/produto/ProdutoResponseDto';
import { adicionarCamposFormatados } from '../../utils/moeda';

/**
 * Mapper para entidade Produto
 */
@Injectable()
export class ProdutoMapper implements IMapper<Produto, ProdutoResponseDto, CreateProdutoDto, UpdateProdutoDto> {
  async toEntity(dto: CreateProdutoDto | UpdateProdutoDto): Promise<Partial<Produto>> {
    const entity: any = {};

    if ('descricao_prod' in dto && dto.descricao_prod !== undefined) {
      entity.descricao_prod = dto.descricao_prod;
    }
    if ('idUnidadeMedida' in dto && dto.idUnidadeMedida !== undefined) {
      entity.idUnidadeMedida = dto.idUnidadeMedida;
    }
    if ('pesoliquido_prod' in dto && dto.pesoliquido_prod !== undefined) {
      entity.pesoliquido_prod = dto.pesoliquido_prod;
    }
    if ('idGrupo' in dto && dto.idGrupo !== undefined) {
      entity.idGrupo = dto.idGrupo;
    }
    if ('idSubGrupo' in dto && dto.idSubGrupo !== undefined) {
      entity.idSubGrupo = dto.idSubGrupo;
    }
    if ('idPrincipioAtivo' in dto && dto.idPrincipioAtivo !== undefined) {
      entity.idPrincipioAtivo = dto.idPrincipioAtivo;
    }
    if ('idFabricante' in dto && dto.idFabricante !== undefined) {
      entity.idFabricante = dto.idFabricante;
    }
    if ('precomedio_prod' in dto && dto.precomedio_prod !== undefined) {
      entity.precomedio_prod = dto.precomedio_prod;
    }
    if ('valorultimaentrada_prod' in dto && dto.valorultimaentrada_prod !== undefined) {
      entity.valorultimaentrada_prod = dto.valorultimaentrada_prod;
    }
    if ('dataultimaentrada_prod' in dto && dto.dataultimaentrada_prod !== undefined) {
      entity.dataultimaentrada_prod = dto.dataultimaentrada_prod as string;
    }
    if ('combustivel_prod' in dto && dto.combustivel_prod !== undefined) {
      entity.combustivel_prod = dto.combustivel_prod;
    }
    if ('custoUltimoCusto_prod' in dto && dto.custoUltimoCusto_prod !== undefined) {
      entity.custoUltimoCusto_prod = dto.custoUltimoCusto_prod;
    }
    if ('valorUltimoCusto_prod' in dto && dto.valorUltimoCusto_prod !== undefined) {
      entity.valorUltimoCusto_prod = dto.valorUltimoCusto_prod;
    }
    if ('atualizacaoCusto_prod' in dto && dto.atualizacaoCusto_prod !== undefined) {
      entity.atualizacaoCusto_prod = dto.atualizacaoCusto_prod as string;
    }
    if ('observacao_prod' in dto && dto.observacao_prod !== undefined) {
      entity.observacao_prod = dto.observacao_prod;
    }
    if ('idIndexador' in dto && dto.idIndexador !== undefined) {
      entity.idIndexador = dto.idIndexador;
    }

    return entity;
  }

  toDto(entity: Produto): ProdutoResponseDto {
    const dto: ProdutoResponseDto = {
      id_prod: entity.id_prod,
      tenantId: entity.tenantId,
      descricao_prod: entity.descricao_prod,
      idUnidadeMedida: entity.idUnidadeMedida,
      pesoliquido_prod: Number(entity.pesoliquido_prod),
      idGrupo: entity.idGrupo,
      idSubGrupo: entity.idSubGrupo,
      idPrincipioAtivo: entity.idPrincipioAtivo,
      idFabricante: entity.idFabricante,
      precomedio_prod: Number(entity.precomedio_prod),
      valorultimaentrada_prod: Number(entity.valorultimaentrada_prod),
      dataultimaentrada_prod: entity.dataultimaentrada_prod,
      combustivel_prod: entity.combustivel_prod,
      custoUltimoCusto_prod: entity.custoUltimoCusto_prod,
      valorUltimoCusto_prod: Number(entity.valorUltimoCusto_prod),
      atualizacaoCusto_prod: entity.atualizacaoCusto_prod,
      observacao_prod: entity.observacao_prod,
      idIndexador: entity.idIndexador,
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

    if ((entity as any).grupo) {
      dto.grupo = {
        id: (entity as any).grupo.id,
        descricao_grupo: (entity as any).grupo.descricao_grupo,
        abreviacao_grupo: (entity as any).grupo.abreviacao_grupo,
      };
    }

    if ((entity as any).subGrupo) {
      dto.subGrupo = {
        id_sub: (entity as any).subGrupo.id_sub,
        descricao_sub: (entity as any).subGrupo.descricao_sub,
      };
    }

    if ((entity as any).principioAtivo) {
      dto.principioAtivo = {
        id_principio: (entity as any).principioAtivo.id_principio,
        descricao_principio: (entity as any).principioAtivo.descricao_principio,
        classe_principio: (entity as any).principioAtivo.classe_principio,
      };
    }

    if ((entity as any).fabricante) {
      dto.fabricante = {
        id_pessoa: (entity as any).fabricante.id_pessoa,
        nomerazao_pessoa: (entity as any).fabricante.nomerazao_pessoa,
        nomefantasia_pessoa: (entity as any).fabricante.nomefantasia_pessoa,
      };
    }

    if ((entity as any).indexador) {
      dto.indexador = {
        id_moeda: (entity as any).indexador.id_moeda,
        descricao_moeda: (entity as any).indexador.descricao_moeda,
        simbolo_moeda: (entity as any).indexador.simbolo_moeda,
      };
    }

    adicionarCamposFormatados(dto, ['precomedio_prod', 'valorultimaentrada_prod', 'valorUltimoCusto_prod']);

    return dto;
  }
}
