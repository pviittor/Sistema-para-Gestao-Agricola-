import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IRegistroArmazenagemApplicationService } from './IRegistroArmazenagemApplicationService';
import { IRegistroArmazenagemRepository } from '../../../infrastructure/repository/IRegistroArmazenagemRepository';
import { IUnidadeDepositoRepository } from '../../../infrastructure/repository/IUnidadeDepositoRepository';
import { IPessoaRepository } from '../../../infrastructure/repository/IPessoaRepository';
import { IProdutoRepository } from '../../../infrastructure/repository/IProdutoRepository';
import { IConfiguradorCicloRepository } from '../../../infrastructure/repository/IConfiguradorCicloRepository';
import { IUnidadeMedidaRepository } from '../../../infrastructure/repository/IUnidadeMedidaRepository';
import { CreateRegistroArmazenagemDto } from '../../dto/registroArmazenagem/CreateRegistroArmazenagemDto';
import { UpdateRegistroArmazenagemDto } from '../../dto/registroArmazenagem/UpdateRegistroArmazenagemDto';
import { RegistroArmazenagemResponseDto } from '../../dto/registroArmazenagem/RegistroArmazenagemResponseDto';
import { RegistroArmazenagemMapper } from '../../mappers/RegistroArmazenagemMapper';
import { Auditable } from '../../../core/audit';
import { RequirePermission } from '../../../core/authorization';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException, ForbiddenException, BusinessException } from '../../../core/exceptions';
import { getRequestContext } from '../../../core/authorization/helpers';
import { TipoRegistroArmazenagem } from '../../../models/enums/RegistroArmazenagemEnums';

/**
 * Application Service para RegistroArmazenagem
 */
@Injectable()
export class RegistroArmazenagemApplicationService implements IRegistroArmazenagemApplicationService {
  constructor(
    @Inject(Symbol.for('IRegistroArmazenagemRepository')) private registroArmazenagemRepository: IRegistroArmazenagemRepository,
    @Inject(Symbol.for('IUnidadeDepositoRepository')) private unidadeDepositoRepository: IUnidadeDepositoRepository,
    @Inject(TYPES.IPessoaRepository) private pessoaRepository: IPessoaRepository,
    @Inject(TYPES.IProdutoRepository) private produtoRepository: IProdutoRepository,
    @Inject(TYPES.IConfiguradorCicloRepository) private configuradorCicloRepository: IConfiguradorCicloRepository,
    @Inject(TYPES.IUnidadeMedidaRepository) private unidadeMedidaRepository: IUnidadeMedidaRepository,
    private mapper: RegistroArmazenagemMapper
  ) {}

  /**
   * Calcula o desconto total a partir dos descontos individuais
   */
  private calcularDescontoTotal(dto: CreateRegistroArmazenagemDto | UpdateRegistroArmazenagemDto): number {
    const descontoUmidade = dto.desconto_umidade ?? 0;
    const descontoImpureza = dto.desconto_impureza ?? 0;
    const descontoAvariados = dto.desconto_avariados ?? 0;
    const descontoEsverdeados = dto.desconto_esverdeados ?? 0;
    const descontoQuebraTecnica = dto.desconto_quebra_tecnica ?? 0;
    const descontoTaxaRecepcao = dto.desconto_taxa_recepcao ?? 0;

    return descontoUmidade + descontoImpureza + descontoAvariados + descontoEsverdeados + descontoQuebraTecnica + descontoTaxaRecepcao;
  }

  @RequirePermission('registroArmazenagem.read')
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<RegistroArmazenagemResponseDto>> {
    const result = await this.registroArmazenagemRepository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(item => this.mapper.toDto(item)),
    };
  }

  @RequirePermission('registroArmazenagem.read')
  async getById(id: number | string): Promise<RegistroArmazenagemResponseDto | null> {
    const registro = await this.registroArmazenagemRepository.findById(id);
    return registro ? this.mapper.toDto(registro) : null;
  }

  @RequirePermission('registroArmazenagem.read')
  async findByUnidadeDeposito(idUnidadeDeposito: number): Promise<RegistroArmazenagemResponseDto[]> {
    const context = getRequestContext();
    if (!context || !context.getTenantId()) {
      throw new ForbiddenException('Tenant não identificado');
    }
    const tenantId = context.getTenantId()!;

    const registros = await this.registroArmazenagemRepository.findByUnidadeDeposito(idUnidadeDeposito, tenantId);
    return registros.map(item => this.mapper.toDto(item));
  }

  @RequirePermission('registroArmazenagem.read')
  async findByPeriodo(dataInicio: string, dataFim: string): Promise<RegistroArmazenagemResponseDto[]> {
    const context = getRequestContext();
    if (!context || !context.getTenantId()) {
      throw new ForbiddenException('Tenant não identificado');
    }
    const tenantId = context.getTenantId()!;

    const registros = await this.registroArmazenagemRepository.findByPeriodo(dataInicio, dataFim, tenantId);
    return registros.map(item => this.mapper.toDto(item));
  }

  @RequirePermission('registroArmazenagem.read')
  async findByProduto(idProduto: number): Promise<RegistroArmazenagemResponseDto[]> {
    const context = getRequestContext();
    if (!context || !context.getTenantId()) {
      throw new ForbiddenException('Tenant não identificado');
    }
    const tenantId = context.getTenantId()!;

    const registros = await this.registroArmazenagemRepository.findByProduto(idProduto, tenantId);
    return registros.map(item => this.mapper.toDto(item));
  }

  @RequirePermission('registroArmazenagem.read')
  async getSaldoByUnidade(idUnidadeDeposito: number): Promise<number> {
    const context = getRequestContext();
    if (!context || !context.getTenantId()) {
      throw new ForbiddenException('Tenant não identificado');
    }
    const tenantId = context.getTenantId()!;

    return await this.registroArmazenagemRepository.getSaldoByUnidade(idUnidadeDeposito, tenantId);
  }

  @RequirePermission('registroArmazenagem.create')
  @Auditable('RegistroArmazenagem')
  @Transactional()
  async create(dto: CreateRegistroArmazenagemDto): Promise<RegistroArmazenagemResponseDto> {
    const context = getRequestContext();
    if (!context || !context.getUserId() || !context.getTenantId()) {
      throw new ForbiddenException(
        'Usuário não autenticado ou tenant não identificado.',
        'USER_NOT_AUTHENTICATED'
      );
    }
    const userId = context.getUserId()!;
    const tenantId = context.getTenantId()!;

    // Validar cross-tenant: Produto deve pertencer ao mesmo tenant
    const produto = await this.produtoRepository.findById(dto.idProduto);
    if (!produto) {
      throw new NotFoundException('Produto não encontrado ou não pertence ao tenant atual');
    }

    // Validar cross-tenant: Unidade de medida deve pertencer ao mesmo tenant
    const unidadeMedida = await this.unidadeMedidaRepository.findById(dto.idUnidadeMedida);
    if (!unidadeMedida) {
      throw new NotFoundException('Unidade de medida não encontrada ou não pertence ao tenant atual');
    }

    // Validar cross-tenant: Origem (configurador de ciclo) deve pertencer ao mesmo tenant
    const origem = await this.configuradorCicloRepository.findById(dto.idOrigem);
    if (!origem) {
      throw new NotFoundException('Origem (configurador de ciclo) não encontrada ou não pertence ao tenant atual');
    }

    // Validar cross-tenant: Unidade de depósito deve pertencer ao mesmo tenant
    const unidadeDeposito = await this.unidadeDepositoRepository.findById(dto.idUnidadeDeposito);
    if (!unidadeDeposito) {
      throw new NotFoundException('Unidade de depósito não encontrada ou não pertence ao tenant atual');
    }

    // Validar se o produto do registro é o mesmo da unidade de depósito
    if (dto.idProduto !== (unidadeDeposito as any).idProduto) {
      throw new BusinessException(
        'O produto do registro deve ser o mesmo produto configurado na unidade de depósito.',
        'PRODUCT_MISMATCH'
      );
    }

    // Validar motorista (se informado)
    if (dto.idMotorista) {
      const pessoa = await this.pessoaRepository.findById(dto.idMotorista);
      if (!pessoa) {
        throw new NotFoundException('Motorista não encontrado ou não pertence ao tenant atual');
      }
      if (!(pessoa as any).motorista_pessoa) {
        throw new BusinessException(
          'A pessoa informada não está cadastrada como motorista.',
          'PERSON_NOT_DRIVER'
        );
      }
    }

    // Calcular desconto total
    const descontoTotal = this.calcularDescontoTotal(dto);

    // Calcular peso líquido a partir de peso bruto, peso tara e descontos
    const pesoLiquido = dto.peso_bruto - dto.peso_tara - descontoTotal;

    // Validar que o peso líquido não é negativo
    if (pesoLiquido < 0) {
      throw new BusinessException(
        'Peso líquido não pode ser negativo. Peso bruto menos peso tara menos descontos resulta em valor negativo.',
        'NEGATIVE_NET_WEIGHT'
      );
    }

    // Validar capacidade/saldo com base no tipo
    const saldoAtual = await this.registroArmazenagemRepository.getSaldoByUnidade(dto.idUnidadeDeposito, tenantId);
    const saldoComInicial = saldoAtual + parseFloat(String((unidadeDeposito as any).saldo_inicial || 0));

    if (dto.tipo === TipoRegistroArmazenagem.Descarga) {
      // Descarga = entrada de produto → verificar capacidade
      const capacidadeTotal = parseFloat(String((unidadeDeposito as any).capacidade_total));
      if (saldoComInicial + pesoLiquido > capacidadeTotal) {
        throw new BusinessException(
          `Capacidade excedida. Saldo atual: ${saldoComInicial.toFixed(4)}, Peso líquido: ${pesoLiquido}, Capacidade total: ${capacidadeTotal.toFixed(4)}.`,
          'CAPACITY_EXCEEDED'
        );
      }
    }

    if (dto.tipo === TipoRegistroArmazenagem.Carga) {
      // Carga = saída de produto → verificar saldo suficiente
      if (saldoComInicial - pesoLiquido < 0) {
        throw new BusinessException(
          `Saldo insuficiente para carga. Saldo atual: ${saldoComInicial.toFixed(4)}, Peso líquido solicitado: ${pesoLiquido}.`,
          'INSUFFICIENT_BALANCE'
        );
      }
    }

    const entityData = await this.mapper.toEntity(dto);

    const entityWithAudit = {
      ...entityData,
      placa: dto.placa,
      peso_bruto: dto.peso_bruto,
      peso_tara: dto.peso_tara,
      peso_liquido: pesoLiquido,
      desconto_total: descontoTotal,
      usercreation: userId,
      datecreation: new Date(),
    };

    const registro = await this.registroArmazenagemRepository.create(entityWithAudit);

    // Buscar registro completo com associações
    const registroCompleto = await this.registroArmazenagemRepository.findById(registro.id);
    return this.mapper.toDto(registroCompleto!);
  }

  @RequirePermission('registroArmazenagem.update')
  @Auditable('RegistroArmazenagem')
  @Transactional()
  async update(id: number | string, dto: UpdateRegistroArmazenagemDto): Promise<RegistroArmazenagemResponseDto> {
    const registroExistente = await this.registroArmazenagemRepository.findById(id);
    if (!registroExistente) {
      throw new NotFoundException('Registro de armazenagem não encontrado');
    }

    const context = getRequestContext();
    if (!context || !context.getTenantId()) {
      throw new ForbiddenException('Tenant não identificado');
    }
    const tenantId = context.getTenantId()!;

    // Determinar valores efetivos (do DTO ou do registro existente)
    const tipoEfetivo = dto.tipo ?? registroExistente.tipo;
    const idProdutoEfetivo = dto.idProduto ?? registroExistente.idProduto;
    const idUnidadeDepositoEfetivo = dto.idUnidadeDeposito ?? registroExistente.idUnidadeDeposito;
    const pesoBrutoEfetivo = dto.peso_bruto ?? registroExistente.peso_bruto ?? 0;
    const pesoTaraEfetivo = dto.peso_tara ?? registroExistente.peso_tara ?? 0;

    // Validar cross-tenant: Produto
    if (dto.idProduto !== undefined) {
      const produto = await this.produtoRepository.findById(dto.idProduto);
      if (!produto) {
        throw new NotFoundException('Produto não encontrado ou não pertence ao tenant atual');
      }
    }

    // Validar cross-tenant: Unidade de medida
    if (dto.idUnidadeMedida !== undefined) {
      const unidadeMedida = await this.unidadeMedidaRepository.findById(dto.idUnidadeMedida);
      if (!unidadeMedida) {
        throw new NotFoundException('Unidade de medida não encontrada ou não pertence ao tenant atual');
      }
    }

    // Validar cross-tenant: Origem
    if (dto.idOrigem !== undefined) {
      const origem = await this.configuradorCicloRepository.findById(dto.idOrigem);
      if (!origem) {
        throw new NotFoundException('Origem (configurador de ciclo) não encontrada ou não pertence ao tenant atual');
      }
    }

    // Validar cross-tenant: Unidade de depósito
    const unidadeDeposito = await this.unidadeDepositoRepository.findById(idUnidadeDepositoEfetivo);
    if (!unidadeDeposito) {
      throw new NotFoundException('Unidade de depósito não encontrada ou não pertence ao tenant atual');
    }

    // Validar se o produto do registro é o mesmo da unidade de depósito
    if (idProdutoEfetivo !== (unidadeDeposito as any).idProduto) {
      throw new BusinessException(
        'O produto do registro deve ser o mesmo produto configurado na unidade de depósito.',
        'PRODUCT_MISMATCH'
      );
    }

    // Validar motorista (se informado)
    if (dto.idMotorista !== undefined && dto.idMotorista !== null) {
      const pessoa = await this.pessoaRepository.findById(dto.idMotorista);
      if (!pessoa) {
        throw new NotFoundException('Motorista não encontrado ou não pertence ao tenant atual');
      }
      if (!(pessoa as any).motorista_pessoa) {
        throw new BusinessException(
          'A pessoa informada não está cadastrada como motorista.',
          'PERSON_NOT_DRIVER'
        );
      }
    }

    // Calcular desconto total (usando valores efetivos)
    const descontoUmidade = dto.desconto_umidade ?? registroExistente.desconto_umidade ?? 0;
    const descontoImpureza = dto.desconto_impureza ?? registroExistente.desconto_impureza ?? 0;
    const descontoAvariados = dto.desconto_avariados ?? registroExistente.desconto_avariados ?? 0;
    const descontoEsverdeados = dto.desconto_esverdeados ?? registroExistente.desconto_esverdeados ?? 0;
    const descontoQuebraTecnica = dto.desconto_quebra_tecnica ?? registroExistente.desconto_quebra_tecnica ?? 0;
    const descontoTaxaRecepcao = dto.desconto_taxa_recepcao ?? registroExistente.desconto_taxa_recepcao ?? 0;
    const descontoTotal = descontoUmidade + descontoImpureza + descontoAvariados + descontoEsverdeados + descontoQuebraTecnica + descontoTaxaRecepcao;

    // Calcular peso líquido efetivo a partir de peso bruto, peso tara e descontos
    const pesoLiquidoEfetivo = pesoBrutoEfetivo - pesoTaraEfetivo - descontoTotal;

    // Validar que o peso líquido não é negativo
    if (pesoLiquidoEfetivo < 0) {
      throw new BusinessException(
        'Peso líquido não pode ser negativo. Peso bruto menos peso tara menos descontos resulta em valor negativo.',
        'NEGATIVE_NET_WEIGHT'
      );
    }

    // Validar capacidade/saldo considerando a alteração
    // Subtrair o registro atual do saldo antes de calcular
    const saldoAtual = await this.registroArmazenagemRepository.getSaldoByUnidade(idUnidadeDepositoEfetivo, tenantId);
    const saldoInicial = parseFloat(String((unidadeDeposito as any).saldo_inicial || 0));

    // Calcular o saldo sem o registro existente
    let saldoSemRegistroAtual = saldoAtual + saldoInicial;
    const pesoExistente = parseFloat(String(registroExistente.peso_liquido));
    if (registroExistente.tipo === TipoRegistroArmazenagem.Descarga) {
      // Descarga = entrada → remover do saldo para recalcular
      saldoSemRegistroAtual -= pesoExistente;
    } else {
      // Carga = saída → devolver ao saldo para recalcular
      saldoSemRegistroAtual += pesoExistente;
    }

    if (tipoEfetivo === TipoRegistroArmazenagem.Descarga) {
      // Descarga = entrada de produto → verificar capacidade
      const capacidadeTotal = parseFloat(String((unidadeDeposito as any).capacidade_total));
      if (saldoSemRegistroAtual + pesoLiquidoEfetivo > capacidadeTotal) {
        throw new BusinessException(
          `Capacidade excedida. Saldo atual (sem este registro): ${saldoSemRegistroAtual.toFixed(4)}, Peso líquido: ${pesoLiquidoEfetivo}, Capacidade total: ${capacidadeTotal.toFixed(4)}.`,
          'CAPACITY_EXCEEDED'
        );
      }
    }

    if (tipoEfetivo === TipoRegistroArmazenagem.Carga) {
      // Carga = saída de produto → verificar saldo suficiente
      if (saldoSemRegistroAtual - pesoLiquidoEfetivo < 0) {
        throw new BusinessException(
          `Saldo insuficiente para carga. Saldo atual (sem este registro): ${saldoSemRegistroAtual.toFixed(4)}, Peso líquido solicitado: ${pesoLiquidoEfetivo}.`,
          'INSUFFICIENT_BALANCE'
        );
      }
    }

    const entityData = await this.mapper.toEntity(dto);

    const entityWithTotal = {
      ...entityData,
      placa: dto.placa,
      peso_bruto: dto.peso_bruto ?? registroExistente.peso_bruto,
      peso_tara: dto.peso_tara ?? registroExistente.peso_tara,
      peso_liquido: pesoLiquidoEfetivo,
      desconto_total: descontoTotal,
    };

    const updated = await this.registroArmazenagemRepository.update(id, entityWithTotal);

    // Buscar registro completo com associações
    const registroCompleto = await this.registroArmazenagemRepository.findById(updated.id);
    return this.mapper.toDto(registroCompleto!);
  }

  @RequirePermission('registroArmazenagem.delete')
  @Auditable('RegistroArmazenagem')
  @Transactional()
  async delete(id: number | string): Promise<boolean> {
    const registro = await this.registroArmazenagemRepository.findById(id);
    if (!registro) {
      return false;
    }

    await this.registroArmazenagemRepository.delete(id);
    return true;
  }
}
