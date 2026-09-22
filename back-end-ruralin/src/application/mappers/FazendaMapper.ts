import { Injectable } from '../../core/di';
import Fazenda from '../../models/Fazenda';
import { CreateFazendaDto, UpdateFazendaDto, FazendaResponseDto } from '../dto/fazenda';

/**
 * Mapper para conversão entre DTOs e entidade Fazenda
 */
@Injectable()
export class FazendaMapper {
  /**
   * Converte CreateFazendaDto para entidade Fazenda
   */
  toEntity(dto: CreateFazendaDto, userId: number, tenantId: number): Partial<Fazenda> {
    return {
      idPessoa: dto.idPessoa,
      descricao: dto.descricao,
      endereco: dto.endereco || null,
      complemento: dto.complemento || null,
      idMunicipio: dto.idMunicipio,
      inscricaoEstadual: dto.inscricaoEstadual || null,
      areaTotal: dto.areaTotal,
      areaCultivada: dto.areaCultivada,
      reservaLegal: dto.reservaLegal,
      telefone: dto.telefone || null,
      gerente: dto.gerente || null,
      matricula: dto.matricula || null,
      livro: dto.livro || null,
      folha: dto.folha || null,
      itr: dto.itr || null,
      cei: dto.cei || null,
      lcdprTipoExploracao: dto.lcdprTipoExploracao || null,
      lcdprParticipacao: dto.lcdprParticipacao || 0,
      arrendada: dto.arrendada || false,
      idPessoaArrendamento: dto.idPessoaArrendamento || null,
      documento: dto.documento || null,
      dataInicio: dto.dataInicio ? new Date(dto.dataInicio) : null,
      dataFim: dto.dataFim ? new Date(dto.dataFim) : null,
      observacoes: dto.observacoes || null,
      movimentaLCDPR: dto.movimentaLCDPR || false,
      movimentaGado: dto.movimentaGado || false,
      tenantId,
      usercreation: userId,
    };
  }

  /**
   * Converte UpdateFazendaDto para entidade Fazenda
   */
  toUpdateEntity(dto: UpdateFazendaDto): Partial<Fazenda> {
    const entity: Partial<Fazenda> = {};

    if (dto.idPessoa !== undefined) {
      entity.idPessoa = dto.idPessoa;
    }
    if (dto.descricao !== undefined) {
      entity.descricao = dto.descricao;
    }
    if (dto.endereco !== undefined) {
      entity.endereco = dto.endereco || null;
    }
    if (dto.complemento !== undefined) {
      entity.complemento = dto.complemento || null;
    }
    if (dto.idMunicipio !== undefined) {
      entity.idMunicipio = dto.idMunicipio;
    }
    if (dto.inscricaoEstadual !== undefined) {
      entity.inscricaoEstadual = dto.inscricaoEstadual || null;
    }
    if (dto.areaTotal !== undefined) {
      entity.areaTotal = dto.areaTotal;
    }
    if (dto.areaCultivada !== undefined) {
      entity.areaCultivada = dto.areaCultivada;
    }
    if (dto.reservaLegal !== undefined) {
      entity.reservaLegal = dto.reservaLegal;
    }
    if (dto.telefone !== undefined) {
      entity.telefone = dto.telefone || null;
    }
    if (dto.gerente !== undefined) {
      entity.gerente = dto.gerente || null;
    }
    if (dto.matricula !== undefined) {
      entity.matricula = dto.matricula || null;
    }
    if (dto.livro !== undefined) {
      entity.livro = dto.livro || null;
    }
    if (dto.folha !== undefined) {
      entity.folha = dto.folha || null;
    }
    if (dto.itr !== undefined) {
      entity.itr = dto.itr || null;
    }
    if (dto.cei !== undefined) {
      entity.cei = dto.cei || null;
    }
    if (dto.lcdprTipoExploracao !== undefined) {
      entity.lcdprTipoExploracao = dto.lcdprTipoExploracao || null;
    }
    if (dto.lcdprParticipacao !== undefined) {
      entity.lcdprParticipacao = dto.lcdprParticipacao;
    }
    if (dto.arrendada !== undefined) {
      entity.arrendada = dto.arrendada;
    }
    if (dto.idPessoaArrendamento !== undefined) {
      entity.idPessoaArrendamento = dto.idPessoaArrendamento || null;
    }
    if (dto.documento !== undefined) {
      entity.documento = dto.documento || null;
    }
    if (dto.dataInicio !== undefined) {
      entity.dataInicio = dto.dataInicio ? new Date(dto.dataInicio) : null;
    }
    if (dto.dataFim !== undefined) {
      entity.dataFim = dto.dataFim ? new Date(dto.dataFim) : null;
    }
    if (dto.observacoes !== undefined) {
      entity.observacoes = dto.observacoes || null;
    }
    if (dto.movimentaLCDPR !== undefined) {
      entity.movimentaLCDPR = dto.movimentaLCDPR;
    }
    if (dto.movimentaGado !== undefined) {
      entity.movimentaGado = dto.movimentaGado;
    }

    return entity;
  }

  /**
   * Converte entidade Fazenda para FazendaResponseDto
   */
  toDto(entity: Fazenda): FazendaResponseDto {
    // Função auxiliar para converter data para string YYYY-MM-DD
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

    return {
      id: entity.id,
      tenantId: entity.tenantId,
      idPessoa: entity.idPessoa,
      descricao: entity.descricao,
      endereco: entity.endereco,
      complemento: entity.complemento,
      idMunicipio: entity.idMunicipio,
      inscricaoEstadual: entity.inscricaoEstadual,
      areaTotal: Number(entity.areaTotal),
      areaCultivada: Number(entity.areaCultivada),
      reservaLegal: Number(entity.reservaLegal),
      telefone: entity.telefone,
      gerente: entity.gerente,
      matricula: entity.matricula,
      livro: entity.livro,
      folha: entity.folha,
      itr: entity.itr,
      cei: entity.cei,
      lcdprTipoExploracao: entity.lcdprTipoExploracao,
      lcdprParticipacao: Number(entity.lcdprParticipacao),
      arrendada: entity.arrendada,
      idPessoaArrendamento: entity.idPessoaArrendamento,
      documento: entity.documento,
      dataInicio: formatDate((entity as any).dataInicio),
      dataFim: formatDate((entity as any).dataFim),
      observacoes: entity.observacoes,
      movimentaLCDPR: entity.movimentaLCDPR,
      movimentaGado: entity.movimentaGado,
      usercreation: entity.usercreation,
      datecreation: entity.datecreation,
      usuarioCriador: (entity as any).usuarioCriador
        ? {
            id: (entity as any).usuarioCriador.id,
            nome: (entity as any).usuarioCriador.nome,
            email: (entity as any).usuarioCriador.email,
          }
        : null,
      pessoa: (entity as any).pessoa
        ? {
            id_pessoa: (entity as any).pessoa.id_pessoa,
            nomerazao_pessoa: (entity as any).pessoa.nomerazao_pessoa,
            cpfcnpj_pessoa: (entity as any).pessoa.cpfcnpj_pessoa,
          }
        : null,
      municipio: (entity as any).municipio
        ? {
            id: (entity as any).municipio.id,
            nome: (entity as any).municipio.nome,
            idEstado: (entity as any).municipio.idEstado,
          }
        : null,
      pessoaArrendamento: (entity as any).pessoaArrendamento
        ? {
            id_pessoa: (entity as any).pessoaArrendamento.id_pessoa,
            nomerazao_pessoa: (entity as any).pessoaArrendamento.nomerazao_pessoa,
            cpfcnpj_pessoa: (entity as any).pessoaArrendamento.cpfcnpj_pessoa,
          }
        : null,
    };
  }
}
