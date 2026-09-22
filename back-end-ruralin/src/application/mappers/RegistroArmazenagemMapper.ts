import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import RegistroArmazenagem from '../../models/RegistroArmazenagem';
import { CreateRegistroArmazenagemDto } from '../dto/registroArmazenagem/CreateRegistroArmazenagemDto';
import { UpdateRegistroArmazenagemDto } from '../dto/registroArmazenagem/UpdateRegistroArmazenagemDto';
import { RegistroArmazenagemResponseDto } from '../dto/registroArmazenagem/RegistroArmazenagemResponseDto';

/**
 * Mapper para entidade RegistroArmazenagem
 */
@Injectable()
export class RegistroArmazenagemMapper implements IMapper<RegistroArmazenagem, RegistroArmazenagemResponseDto, CreateRegistroArmazenagemDto, UpdateRegistroArmazenagemDto> {
  async toEntity(dto: CreateRegistroArmazenagemDto | UpdateRegistroArmazenagemDto): Promise<Partial<RegistroArmazenagem>> {
    const entity: any = {};

    if ('tipo' in dto && dto.tipo !== undefined) {
      entity.tipo = dto.tipo;
    }
    if ('data' in dto && dto.data !== undefined) {
      entity.data = dto.data;
    }
    if ('hora' in dto && dto.hora !== undefined) {
      entity.hora = dto.hora;
    }
    if ('idProduto' in dto && dto.idProduto !== undefined) {
      entity.idProduto = dto.idProduto;
    }
    if ('idUnidadeMedida' in dto && dto.idUnidadeMedida !== undefined) {
      entity.idUnidadeMedida = dto.idUnidadeMedida;
    }
    if ('idOrigem' in dto && dto.idOrigem !== undefined) {
      entity.idOrigem = dto.idOrigem;
    }
    if ('idUnidadeDeposito' in dto && dto.idUnidadeDeposito !== undefined) {
      entity.idUnidadeDeposito = dto.idUnidadeDeposito;
    }
    if ('idMotorista' in dto && dto.idMotorista !== undefined) {
      entity.idMotorista = dto.idMotorista;
    }
    if ('ticket' in dto && dto.ticket !== undefined) {
      entity.ticket = dto.ticket;
    }
    if ('placa' in dto && dto.placa !== undefined) {
      entity.placa = dto.placa;
    }
    if ('peso_bruto' in dto && dto.peso_bruto !== undefined) {
      entity.peso_bruto = dto.peso_bruto;
    }
    if ('peso_tara' in dto && dto.peso_tara !== undefined) {
      entity.peso_tara = dto.peso_tara;
    }
    if ('peso_liquido' in dto && dto.peso_liquido !== undefined) {
      entity.peso_liquido = dto.peso_liquido;
    }
    if ('desconto_umidade' in dto && dto.desconto_umidade !== undefined) {
      entity.desconto_umidade = dto.desconto_umidade;
    }
    if ('desconto_impureza' in dto && dto.desconto_impureza !== undefined) {
      entity.desconto_impureza = dto.desconto_impureza;
    }
    if ('desconto_avariados' in dto && dto.desconto_avariados !== undefined) {
      entity.desconto_avariados = dto.desconto_avariados;
    }
    if ('desconto_esverdeados' in dto && dto.desconto_esverdeados !== undefined) {
      entity.desconto_esverdeados = dto.desconto_esverdeados;
    }
    if ('desconto_quebra_tecnica' in dto && dto.desconto_quebra_tecnica !== undefined) {
      entity.desconto_quebra_tecnica = dto.desconto_quebra_tecnica;
    }
    if ('desconto_taxa_recepcao' in dto && dto.desconto_taxa_recepcao !== undefined) {
      entity.desconto_taxa_recepcao = dto.desconto_taxa_recepcao;
    }
    if ('observacoes' in dto && dto.observacoes !== undefined) {
      entity.observacoes = dto.observacoes;
    }

    return entity;
  }

  toDto(entity: RegistroArmazenagem): RegistroArmazenagemResponseDto {
    const dto: RegistroArmazenagemResponseDto = {
      id: entity.id,
      tenantId: entity.tenantId,
      tipo: entity.tipo,
      data: entity.data,
      hora: entity.hora,
      idProduto: entity.idProduto,
      idUnidadeMedida: entity.idUnidadeMedida,
      idOrigem: entity.idOrigem,
      idUnidadeDeposito: entity.idUnidadeDeposito,
      idMotorista: entity.idMotorista,
      ticket: entity.ticket,
      placa: entity.placa,
      peso_bruto: entity.peso_bruto,
      peso_tara: entity.peso_tara,
      peso_liquido: entity.peso_liquido,
      desconto_umidade: entity.desconto_umidade,
      desconto_impureza: entity.desconto_impureza,
      desconto_avariados: entity.desconto_avariados,
      desconto_esverdeados: entity.desconto_esverdeados,
      desconto_quebra_tecnica: entity.desconto_quebra_tecnica,
      desconto_taxa_recepcao: entity.desconto_taxa_recepcao,
      desconto_total: entity.desconto_total,
      observacoes: entity.observacoes,
      usercreation: entity.usercreation,
      datecreation: entity.datecreation,
    };

    if ((entity as any).produto) {
      dto.produto = {
        id_prod: (entity as any).produto.id_prod,
        descricao_prod: (entity as any).produto.descricao_prod,
      };
    }

    if ((entity as any).unidadeMedida) {
      dto.unidadeMedida = {
        id_unidade: (entity as any).unidadeMedida.id_unidade,
        descricao_unidade: (entity as any).unidadeMedida.descricao_unidade,
        abreviatura_unidade: (entity as any).unidadeMedida.abreviatura_unidade,
      };
    }

    if ((entity as any).origem) {
      dto.origem = {
        id_cfg: (entity as any).origem.id_cfg,
        idTalhao: (entity as any).origem.idTalhao,
        idCiclo: (entity as any).origem.idCiclo,
        idCultura: (entity as any).origem.idCultura,
        talhao: (entity as any).origem.talhao ? {
          id_talhao: (entity as any).origem.talhao.id_talhao,
          descricao: (entity as any).origem.talhao.descricao,
        } : undefined,
      };
    }

    if ((entity as any).unidadeDeposito) {
      dto.unidadeDeposito = {
        id: (entity as any).unidadeDeposito.id,
        descricao: (entity as any).unidadeDeposito.descricao,
      };
    }

    if ((entity as any).motorista) {
      dto.motorista = {
        id_pessoa: (entity as any).motorista.id_pessoa,
        nomerazao_pessoa: (entity as any).motorista.nomerazao_pessoa,
      };
    }

    if ((entity as any).usuario) {
      dto.usuario = {
        id: (entity as any).usuario.id,
        nome: (entity as any).usuario.nome,
        email: (entity as any).usuario.email,
      };
    }

    return dto;
  }
}
