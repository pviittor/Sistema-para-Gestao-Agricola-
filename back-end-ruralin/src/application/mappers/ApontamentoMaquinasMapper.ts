import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import ApontamentoMaquinas from '../../models/ApontamentoMaquinas';
import { CreateApontamentoMaquinasDto } from '../dto/apontamentoMaquinas/CreateApontamentoMaquinasDto';
import { UpdateApontamentoMaquinasDto } from '../dto/apontamentoMaquinas/UpdateApontamentoMaquinasDto';
import { ApontamentoMaquinasResponseDto } from '../dto/apontamentoMaquinas/ApontamentoMaquinasResponseDto';
import { adicionarCamposFormatados } from '../../utils/moeda';

/**
 * Mapper para entidade ApontamentoMaquinas
 */
@Injectable()
export class ApontamentoMaquinasMapper implements IMapper<ApontamentoMaquinas, ApontamentoMaquinasResponseDto, CreateApontamentoMaquinasDto, UpdateApontamentoMaquinasDto> {
  async toEntity(dto: CreateApontamentoMaquinasDto | UpdateApontamentoMaquinasDto): Promise<Partial<ApontamentoMaquinas>> {
    const entity: any = {};

    if ('idApontamento' in dto && dto.idApontamento !== undefined) {
      entity.idApontamento = dto.idApontamento;
    }
    if ('idMaquina' in dto && dto.idMaquina !== undefined) {
      entity.idMaquina = dto.idMaquina;
    }
    if ('idImplemento' in dto && dto.idImplemento !== undefined) {
      entity.idImplemento = dto.idImplemento;
    }
    if ('idOperador' in dto && dto.idOperador !== undefined) {
      entity.idOperador = dto.idOperador;
    }
    if ('idAbastecimento' in dto && dto.idAbastecimento !== undefined) {
      entity.idAbastecimento = dto.idAbastecimento;
    }
    if ('data' in dto && dto.data !== undefined) {
      entity.data = dto.data;
    }
    if ('horaInicio' in dto && dto.horaInicio !== undefined) {
      entity.horaInicio = dto.horaInicio;
    }
    if ('horaFim' in dto && dto.horaFim !== undefined) {
      entity.horaFim = dto.horaFim;
    }
    if ('horaTotal' in dto && dto.horaTotal !== undefined) {
      entity.horaTotal = dto.horaTotal;
    }
    if ('valorHora' in dto && dto.valorHora !== undefined) {
      entity.valorHora = dto.valorHora;
    }
    if ('valorHoraImpl' in dto && dto.valorHoraImpl !== undefined) {
      entity.valorHoraImpl = dto.valorHoraImpl;
    }
    if ('vazao' in dto && dto.vazao !== undefined) {
      entity.vazao = dto.vazao;
    }
    if ('haBomba' in dto && dto.haBomba !== undefined) {
      entity.haBomba = dto.haBomba;
    }
    if ('velocidade' in dto && dto.velocidade !== undefined) {
      entity.velocidade = dto.velocidade;
    }
    if ('pulv' in dto && dto.pulv !== undefined) {
      entity.pulv = dto.pulv;
    }
    if ('consumoEstimado' in dto && dto.consumoEstimado !== undefined) {
      entity.consumoEstimado = dto.consumoEstimado;
    }
    if ('estimativaCombustivelUtilizado' in dto && dto.estimativaCombustivelUtilizado !== undefined) {
      entity.estimativaCombustivelUtilizado = dto.estimativaCombustivelUtilizado;
    }
    if ('informouAbastecimento' in dto && dto.informouAbastecimento !== undefined) {
      entity.informouAbastecimento = dto.informouAbastecimento;
    }
    if ('consumoHRMaquina' in dto && dto.consumoHRMaquina !== undefined) {
      entity.consumoHRMaquina = dto.consumoHRMaquina;
    }
    if ('consumoHRImplemento' in dto && dto.consumoHRImplemento !== undefined) {
      entity.consumoHRImplemento = dto.consumoHRImplemento;
    }
    if ('consumoHAMaquina' in dto && dto.consumoHAMaquina !== undefined) {
      entity.consumoHAMaquina = dto.consumoHAMaquina;
    }
    if ('consumoHAImplemento' in dto && dto.consumoHAImplemento !== undefined) {
      entity.consumoHAImplemento = dto.consumoHAImplemento;
    }
    if ('custoHAMaquina' in dto && dto.custoHAMaquina !== undefined) {
      entity.custoHAMaquina = dto.custoHAMaquina;
    }
    if ('custoHAImplemento' in dto && dto.custoHAImplemento !== undefined) {
      entity.custoHAImplemento = dto.custoHAImplemento;
    }
    if ('custoHRMaquina' in dto && dto.custoHRMaquina !== undefined) {
      entity.custoHRMaquina = dto.custoHRMaquina;
    }
    if ('custoHRImplemento' in dto && dto.custoHRImplemento !== undefined) {
      entity.custoHRImplemento = dto.custoHRImplemento;
    }
    if ('areaTrabalhada' in dto && dto.areaTrabalhada !== undefined) {
      entity.areaTrabalhada = dto.areaTrabalhada;
    }

    return entity;
  }

  toDto(entity: ApontamentoMaquinas): ApontamentoMaquinasResponseDto {
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

    const dto: ApontamentoMaquinasResponseDto = {
      id_aptmaq: entity.id_aptmaq,
      tenantId: entity.tenantId,
      idApontamento: entity.idApontamento,
      idMaquina: entity.idMaquina,
      idImplemento: entity.idImplemento,
      idOperador: entity.idOperador,
      idAbastecimento: entity.idAbastecimento,
      data: formatDate((entity as any).data) || entity.data,
      horaInicio: entity.horaInicio != null ? Number(entity.horaInicio) : 0,
      horaFim: entity.horaFim != null ? Number(entity.horaFim) : 0,
      horaTotal: entity.horaTotal != null ? Number(entity.horaTotal) : 0,
      valorHora: entity.valorHora != null ? Number(entity.valorHora) : 0,
      valorHoraImpl: entity.valorHoraImpl != null ? Number(entity.valorHoraImpl) : 0,
      vazao: entity.vazao != null ? Number(entity.vazao) : 0,
      haBomba: entity.haBomba != null ? Number(entity.haBomba) : 0,
      velocidade: entity.velocidade != null ? Number(entity.velocidade) : 0,
      pulv: entity.pulv != null ? Number(entity.pulv) : 0,
      consumoEstimado: entity.consumoEstimado != null ? Number(entity.consumoEstimado) : 0,
      estimativaCombustivelUtilizado: entity.estimativaCombustivelUtilizado != null ? Number(entity.estimativaCombustivelUtilizado) : 0,
      informouAbastecimento: entity.informouAbastecimento,
      consumoHRMaquina: entity.consumoHRMaquina != null ? Number(entity.consumoHRMaquina) : 0,
      consumoHRImplemento: entity.consumoHRImplemento != null ? Number(entity.consumoHRImplemento) : 0,
      consumoHAMaquina: entity.consumoHAMaquina != null ? Number(entity.consumoHAMaquina) : 0,
      consumoHAImplemento: entity.consumoHAImplemento != null ? Number(entity.consumoHAImplemento) : 0,
      custoHAMaquina: entity.custoHAMaquina != null ? Number(entity.custoHAMaquina) : 0,
      custoHAImplemento: entity.custoHAImplemento != null ? Number(entity.custoHAImplemento) : 0,
      custoHRMaquina: entity.custoHRMaquina != null ? Number(entity.custoHRMaquina) : 0,
      custoHRImplemento: entity.custoHRImplemento != null ? Number(entity.custoHRImplemento) : 0,
      areaTrabalhada: entity.areaTrabalhada != null ? Number(entity.areaTrabalhada) : 0,
      usercreation: entity.usercreation,
      datecreation: entity.datecreation,
    };

    // Relacionamentos condicionais
    if ((entity as any).apontamento) {
      dto.apontamento = {
        id_apt: (entity as any).apontamento.id_apt,
      };
    }

    if ((entity as any).maquina) {
      dto.maquina = {
        id_mqn: (entity as any).maquina.id_mqn,
        descricao: (entity as any).maquina.descricao,
      };
    }

    if ((entity as any).implemento) {
      dto.implemento = {
        id_mqn: (entity as any).implemento.id_mqn,
        descricao: (entity as any).implemento.descricao,
      };
    }

    if ((entity as any).operador) {
      dto.operador = {
        id_pessoa: (entity as any).operador.id_pessoa,
        nomerazao_pessoa: (entity as any).operador.nomerazao_pessoa,
      };
    }

    if ((entity as any).abastecimento) {
      dto.abastecimento = {
        id_abast: (entity as any).abastecimento.id_abast,
        data: (entity as any).abastecimento.data,
      };
    }

    if ((entity as any).usuarioCriador) {
      dto.usuarioCriador = {
        id: (entity as any).usuarioCriador.id,
        nome: (entity as any).usuarioCriador.nome,
        email: (entity as any).usuarioCriador.email,
      };
    }

    adicionarCamposFormatados(dto, ['valorHora', 'valorHoraImpl', 'custoHAMaquina', 'custoHAImplemento', 'custoHRMaquina', 'custoHRImplemento']);

    return dto;
  }
}
