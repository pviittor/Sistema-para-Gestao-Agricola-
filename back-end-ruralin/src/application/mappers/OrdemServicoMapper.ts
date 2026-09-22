import { Injectable } from '../../core/di';
import OrdemServico from '../../models/OrdemServico';
import { CreateOrdemServicoDto } from '../dto/ordemServico/CreateOrdemServicoDto';
import { UpdateOrdemServicoDto } from '../dto/ordemServico/UpdateOrdemServicoDto';
import { OrdemServicoResponseDto } from '../dto/ordemServico/OrdemServicoResponseDto';

/**
 * OrdemServicoMapper - Mapper para entidade OrdemServico
 *
 * Responsável por converter entre DTOs e entidades do domínio para OrdemServico.
 * Inclui mapeamento nested de todos os filhos (talhoes, insumos, maquinas, responsaveis)
 * e entidades relacionadas (tipoAtividade, safra, fazenda, usuários de workflow).
 */
@Injectable()
export class OrdemServicoMapper {
  /**
   * Converte uma data (Date, string ou null/undefined) para string YYYY-MM-DD
   */
  private formatDate(date: Date | string | null | undefined): string | null {
    if (!date) return null;
    if (typeof date === 'string') return date.split('T')[0];
    if (date instanceof Date) return date.toISOString().split('T')[0];
    return null;
  }

  /**
   * Converte entidade do domínio para DTO de resposta
   *
   * @param entity - Entidade OrdemServico (pode incluir filhos via Sequelize include)
   * @returns DTO de resposta completo com todos os campos e relacionamentos
   */
  toDto(entity: OrdemServico): OrdemServicoResponseDto {
    const dto: OrdemServicoResponseDto = {
      id: entity.id,
      tenantId: entity.tenantId,
      numero: entity.numero,
      tipoAtividadeOSId: entity.tipoAtividadeOSId,
      safraId: entity.safraId ?? null,
      fazendaId: entity.fazendaId,
      descricao: entity.descricao ?? null,
      status: entity.status,
      prioridade: entity.prioridade,
      dataPlanejadaInicio: this.formatDate(entity.dataPlanejadaInicio as any),
      dataPlanejadaFim: this.formatDate(entity.dataPlanejadaFim as any),
      dataInicioReal: this.formatDate(entity.dataInicioReal as any),
      dataFimReal: this.formatDate(entity.dataFimReal as any),
      areaPlanejadaTotal: entity.areaPlanejadaTotal ?? null,
      areaRealTotal: entity.areaRealTotal ?? null,
      custoEstimado: entity.custoEstimado ?? null,
      custoReal: entity.custoReal ?? null,
      varianciaAreaPercent: entity.varianciaAreaPercent ?? null,
      varianciaCustoPercent: entity.varianciaCustoPercent ?? null,
      varianciaDias: entity.varianciaDias ?? null,
      camposCondicionais: entity.camposCondicionais ?? null,
      observacoes: entity.observacoes ?? null,
      observacoesConclusao: entity.observacoesConclusao ?? null,
      motivoCancelamento: entity.motivoCancelamento ?? null,
      criadoPorId: entity.criadoPorId ?? null,
      atribuidoPorId: entity.atribuidoPorId ?? null,
      iniciadoPorId: entity.iniciadoPorId ?? null,
      concluidoPorId: entity.concluidoPorId ?? null,
      validadoPorId: entity.validadoPorId ?? null,
      canceladoPorId: entity.canceladoPorId ?? null,
      dataValidacao: this.formatDate(entity.dataValidacao as any),
      estoqueProcessado: entity.estoqueProcessado,
      financeiroProcessado: entity.financeiroProcessado,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };

    // Entidade tipoAtividade
    if (entity.tipoAtividade) {
      dto.tipoAtividade = {
        id: entity.tipoAtividade.id,
        nome: entity.tipoAtividade.nome,
        categoria: entity.tipoAtividade.categoria,
        icone: entity.tipoAtividade.icone ?? null,
        cor: entity.tipoAtividade.cor ?? null,
      };
    }

    // Entidade safra
    if (entity.safra) {
      dto.safra = {
        id: (entity.safra as any).id,
        nome: (entity.safra as any).nome,
      };
    }

    // Entidade fazenda
    if (entity.fazenda) {
      dto.fazenda = {
        id: (entity.fazenda as any).id,
        nome: (entity.fazenda as any).descricao || (entity.fazenda as any).nome,
      };
    }

    // Usuários de workflow
    if (entity.criadoPor) {
      dto.criadoPor = {
        id: (entity.criadoPor as any).id,
        nome: (entity.criadoPor as any).nome,
      };
    }

    if (entity.atribuidoPor) {
      dto.atribuidoPor = {
        id: (entity.atribuidoPor as any).id,
        nome: (entity.atribuidoPor as any).nome,
      };
    }

    if (entity.iniciadoPor) {
      dto.iniciadoPor = {
        id: (entity.iniciadoPor as any).id,
        nome: (entity.iniciadoPor as any).nome,
      };
    }

    if (entity.concluidoPor) {
      dto.concluidoPor = {
        id: (entity.concluidoPor as any).id,
        nome: (entity.concluidoPor as any).nome,
      };
    }

    if (entity.validadoPor) {
      dto.validadoPor = {
        id: (entity.validadoPor as any).id,
        nome: (entity.validadoPor as any).nome,
      };
    }

    if (entity.canceladoPor) {
      dto.canceladoPor = {
        id: (entity.canceladoPor as any).id,
        nome: (entity.canceladoPor as any).nome,
      };
    }

    // Array de talhões
    if (entity.talhoes && Array.isArray(entity.talhoes)) {
      dto.talhoes = entity.talhoes.map((t: any) => ({
        id: t.id,
        talhaoId: t.talhaoId,
        talhao: t.talhao ? { descricao: t.talhao.descricao } : null,
        areaPlanejada: t.areaPlanejada ?? null,
        areaReal: t.areaReal ?? null,
        percentualArea: t.percentualArea ?? null,
        custoRateado: t.custoRateado ?? null,
        observacoes: t.observacoes ?? null,
      }));
    }

    // Array de insumos
    if (entity.insumos && Array.isArray(entity.insumos)) {
      dto.insumos = entity.insumos.map((i: any) => ({
        id: i.id,
        produtoId: i.produtoId,
        produto: i.produto ? { descricao: i.produto.descricao } : null,
        unidadeMedidaId: i.unidadeMedidaId ?? null,
        unidadeMedida: i.unidadeMedida ? { nome: i.unidadeMedida.nome } : null,
        quantidadePlanejada: i.quantidadePlanejada ?? null,
        custoUnitarioPlanejado: i.custoUnitarioPlanejado ?? null,
        quantidadeReal: i.quantidadeReal ?? null,
        custoUnitarioReal: i.custoUnitarioReal ?? null,
        dosagem: i.dosagem ?? null,
        areaAplicada: i.areaAplicada ?? null,
        observacoes: i.observacoes ?? null,
      }));
    }

    // Array de máquinas
    if (entity.maquinas && Array.isArray(entity.maquinas)) {
      dto.maquinas = entity.maquinas.map((m: any) => ({
        id: m.id,
        maquinaId: m.maquinaId,
        maquina: m.maquina ? { descricao: m.maquina.descricao } : null,
        implementoId: m.implementoId ?? null,
        implemento: m.implemento ? { descricao: m.implemento.descricao } : null,
        operadorId: m.operadorId ?? null,
        operador: m.operador ? { nomerazao_pessoa: m.operador.nomerazao_pessoa ?? null } : null,
        horasPlanejadas: m.horasPlanejadas ?? null,
        custoHoraPlanejado: m.custoHoraPlanejado ?? null,
        horasReais: m.horasReais ?? null,
        custoHoraReal: m.custoHoraReal ?? null,
        horimetroInicio: m.horimetroInicio ?? null,
        horimetroFim: m.horimetroFim ?? null,
        areaTrabalhada: m.areaTrabalhada ?? null,
        consumoCombustivel: m.consumoCombustivel ?? null,
        observacoes: m.observacoes ?? null,
      }));
    }

    // Array de responsáveis
    if (entity.responsaveis && Array.isArray(entity.responsaveis)) {
      dto.responsaveis = entity.responsaveis.map((r: any) => ({
        id: r.id,
        pessoaId: r.pessoaId,
        pessoa: r.pessoa ? { nomerazao_pessoa: r.pessoa.nomerazao_pessoa ?? null } : null,
        funcao: r.funcao,
        horasPlanejadas: r.horasPlanejadas ?? null,
        custoHoraPlanejado: r.custoHoraPlanejado ?? null,
        horasReais: r.horasReais ?? null,
        custoHoraReal: r.custoHoraReal ?? null,
        observacoes: r.observacoes ?? null,
      }));
    }

    return dto;
  }

  /**
   * Converte DTO para atributos da entidade
   *
   * @param dto - DTO de criação ou atualização
   * @returns Atributos parciais da entidade
   */
  toEntity(dto: CreateOrdemServicoDto | UpdateOrdemServicoDto | any): Partial<OrdemServico> {
    const entity: any = {};

    if ('tipoAtividadeOSId' in dto && dto.tipoAtividadeOSId !== undefined) entity.tipoAtividadeOSId = dto.tipoAtividadeOSId;
    if ('fazendaId' in dto && dto.fazendaId !== undefined) entity.fazendaId = dto.fazendaId;
    if ('safraId' in dto && dto.safraId !== undefined) entity.safraId = dto.safraId;
    if ('descricao' in dto && dto.descricao !== undefined) entity.descricao = dto.descricao;
    if ('prioridade' in dto && dto.prioridade !== undefined) entity.prioridade = dto.prioridade;
    if ('dataPlanejadaInicio' in dto && dto.dataPlanejadaInicio !== undefined) {
      entity.dataPlanejadaInicio = dto.dataPlanejadaInicio ? new Date(dto.dataPlanejadaInicio) : null;
    }
    if ('dataPlanejadaFim' in dto && dto.dataPlanejadaFim !== undefined) {
      entity.dataPlanejadaFim = dto.dataPlanejadaFim ? new Date(dto.dataPlanejadaFim) : null;
    }
    if ('custoEstimado' in dto && dto.custoEstimado !== undefined) entity.custoEstimado = dto.custoEstimado;
    if ('camposCondicionais' in dto && dto.camposCondicionais !== undefined) entity.camposCondicionais = dto.camposCondicionais;
    if ('observacoes' in dto && dto.observacoes !== undefined) entity.observacoes = dto.observacoes;

    return entity;
  }
}
