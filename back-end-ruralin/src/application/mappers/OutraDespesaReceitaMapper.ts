import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import OutraDespesaReceita from '../../models/OutraDespesaReceita';
import { CreateOutraDespesaReceitaDto } from '../dto/outraDespesaReceita/CreateOutraDespesaReceitaDto';
import { UpdateOutraDespesaReceitaDto } from '../dto/outraDespesaReceita/UpdateOutraDespesaReceitaDto';
import { OutraDespesaReceitaResponseDto } from '../dto/outraDespesaReceita/OutraDespesaReceitaResponseDto';
import { adicionarCamposFormatados } from '../../utils/moeda';

/**
 * Mapper para entidade OutraDespesaReceita
 */
@Injectable()
export class OutraDespesaReceitaMapper implements IMapper<OutraDespesaReceita, OutraDespesaReceitaResponseDto, CreateOutraDespesaReceitaDto, UpdateOutraDespesaReceitaDto> {
  async toEntity(dto: CreateOutraDespesaReceitaDto | UpdateOutraDespesaReceitaDto): Promise<Partial<OutraDespesaReceita>> {
    const entity: any = {};

    if ('planoGerencialId' in dto && dto.planoGerencialId !== undefined) {
      entity.planoGerencialId = dto.planoGerencialId;
    }
    if ('dataMovimento' in dto && dto.dataMovimento !== undefined) {
      entity.dataMovimento = dto.dataMovimento;
    }
    if ('valor' in dto && dto.valor !== undefined) {
      entity.valor = dto.valor;
    }
    if ('observacoes' in dto && dto.observacoes !== undefined) {
      entity.observacoes = dto.observacoes;
    }
    if ('tipo' in dto && dto.tipo !== undefined) {
      entity.tipo = dto.tipo;
    }
    if ('tipoAlocacao' in dto && dto.tipoAlocacao !== undefined) {
      entity.tipoAlocacao = dto.tipoAlocacao;
    }
    if ('configuradorCicloId' in dto) {
      entity.configuradorCicloId = dto.configuradorCicloId ?? null;
    }

    return entity;
  }

  toDto(entity: OutraDespesaReceita): OutraDespesaReceitaResponseDto {
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

    const dto: OutraDespesaReceitaResponseDto = {
      id: entity.id,
      tenantId: entity.tenantId,
      planoGerencialId: entity.planoGerencialId,
      dataMovimento: formatDate((entity as any).dataMovimento) ?? '',
      valor: entity.valor != null ? Number(entity.valor) : 0,
      observacoes: entity.observacoes,
      tipo: entity.tipo,
      tipoAlocacao: entity.tipoAlocacao,
      configuradorCicloId: entity.configuradorCicloId,
      usercreation: entity.usercreation,
      datecreation: entity.datecreation,
    };

    // Relacionamentos condicionais
    if ((entity as any).planoGerencial) {
      dto.planoGerencial = {
        id: (entity as any).planoGerencial.id,
        item: (entity as any).planoGerencial.item,
        descricao: (entity as any).planoGerencial.descricao,
      };
    }

    if ((entity as any).configuradorCiclo) {
      dto.configuradorCiclo = {
        id_cfg: (entity as any).configuradorCiclo.id_cfg,
        idTalhao: (entity as any).configuradorCiclo.idTalhao,
        idCiclo: (entity as any).configuradorCiclo.idCiclo,
        idCultura: (entity as any).configuradorCiclo.idCultura,
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
