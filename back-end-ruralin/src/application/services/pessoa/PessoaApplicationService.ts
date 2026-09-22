/**
 * PessoaApplicationService - Application Service para entidade Pessoa
 * 
 * Contém a lógica de negócio para operações com pessoas, separando
 * controllers (HTTP) da lógica de aplicação.
 * 
 * Responsabilidades:
 * - Validações de negócio
 * - Regras de negócio (validações de CPF/CNPJ, tipo de pessoa)
 * - Orquestração de repositórios e mappers
 * - Transformações de dados
 * 
 * @example
 * ```typescript
 * const service = container.resolve<IPessoaApplicationService>(TYPES.IPessoaApplicationService);
 * 
 * const pessoa = await service.create({
 *   nomerazao_pessoa: 'João Silva',
 *   cpfcnpj_pessoa: '12345678901',
 *   tipo_pessoa: 1,
 *   // ...
 * });
 * ```
 */

import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IPessoaApplicationService } from './IPessoaApplicationService';
import { IPessoaRepository } from '../../../infrastructure/repository/IPessoaRepository';
import { ITenantService } from '../../../core/tenant/ITenantService';
import { PessoaMapper } from '../../mappers/PessoaMapper';
import { CreatePessoaDto } from '../../dto/pessoa/CreatePessoaDto';
import { UpdatePessoaDto } from '../../dto/pessoa/UpdatePessoaDto';
import { PessoaResponseDto } from '../../dto/pessoa/PessoaResponseDto';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException, BusinessException, ForbiddenException } from '../../../core/exceptions';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { RequirePermission } from '../../../core/authorization';
import { Auditable } from '../../../core/audit';
import { Cacheable, CacheEvict } from '../../../core/cache';
import { getRequestContext } from '../../../core/authorization/helpers';
import { IAuditService } from '../../../core/audit/IAuditService'; 
/**
 * Application Service para entidade Pessoa
 * 
 * Implementa lógica de negócio para operações com pessoas, usando
 * repositório para acesso a dados e mapper para conversão DTO-Entidade.
 */
@Injectable()
export class PessoaApplicationService implements IPessoaApplicationService {
  private mapper: PessoaMapper;

  constructor(
    @Inject(TYPES.IAuditService)
    private auditService: IAuditService,
    @Inject(TYPES.IPessoaRepository)
    private repository: IPessoaRepository,
    @Inject(TYPES.ITenantService)
    private tenantService: ITenantService
  ) {
    // Criar instância do mapper (pode ser injetado no futuro se necessário)
    this.mapper = new PessoaMapper();
  }

  /**
   * Cria uma nova pessoa
   * 
   * @param dto - DTO com dados para criação
   * @returns Promise que resolve com o DTO da pessoa criada
   * @throws BusinessException se validações de negócio falharem
   * @throws ForbiddenException se usuário não tiver permissão 'pessoa.create'
   */
  @RequirePermission('pessoa.create')
  @Transactional()
  @Auditable('Pessoa')
  @CacheEvict('pessoa:list:*', true)
  @CacheEvict('pessoa:findByCpfCnpj:*', true)
  @CacheEvict('pessoa:findByEmail:*', true)
  @CacheEvict('pessoa:findByTipo:*', true)
  @CacheEvict('pessoa:findByUserCreation:*', true)
  async create(dto: CreatePessoaDto): Promise<PessoaResponseDto> {
    // Obter userId do contexto
    const context = getRequestContext();
    if (!context || !context.getUserId()) {
      throw new ForbiddenException(
        'Usuário não autenticado. Não é possível criar pessoa sem userId.',
        'USER_NOT_AUTHENTICATED'
      );
    }
    const userId = context.getUserId()!;

    // Obter tenantId do contexto
    const tenantId = context.getTenantId();
    if (!tenantId) {
      throw new ForbiddenException(
        'Tenant não identificado. Não é possível criar pessoa sem tenantId.',
        'TENANT_NOT_IDENTIFIED'
      );
    }

    // Validação de negócio: validar CPF/CNPJ baseado em tipo_pessoa
    if (dto.cpfcnpj_pessoa) {
      await this.validarCpfCnpj(dto.cpfcnpj_pessoa, dto.tipo_pessoa);
    }

    // Validação de negócio: validar campos obrigatórios por tipo
    this.validarCamposPorTipo(dto);

    // Converter DTO para entidade
    const entity = await this.mapper.toEntity(dto);

    // Adicionar campos automáticos
    (entity as any).usercreation = userId;
    (entity as any).datecreation = new Date();
    (entity as any).tenantId = tenantId;

    // Criar via repositório
    const created = await this.repository.create(entity as any);

    // Registrar auditoria
    await this.auditService.logCreate('pessoa', userId, dto);

    // Retornar como DTO
    return this.mapper.toDto(created);
  }

  /**
   * Atualiza uma pessoa existente
   * 
   * @param id - ID da pessoa
   * @param dto - DTO com dados para atualização
   * @returns Promise que resolve com o DTO da pessoa atualizada
   * @throws NotFoundException se pessoa não for encontrada
   * @throws BusinessException se validações de negócio falharem
   * @throws ForbiddenException se usuário não tiver permissão 'pessoa.update'
   */
  @RequirePermission('pessoa.update')
  @Transactional()
  @Auditable('Pessoa')
  @CacheEvict('pessoa:getById:{0}')
  @CacheEvict('pessoa:list:*', true)
  @CacheEvict('pessoa:findByCpfCnpj:*', true)
  @CacheEvict('pessoa:findByEmail:*', true)
  @CacheEvict('pessoa:findByTipo:*', true)
  @CacheEvict('pessoa:findByUserCreation:*', true)
  async update(id: number | string, dto: UpdatePessoaDto): Promise<PessoaResponseDto> {
    // Verificar se pessoa existe
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException('Pessoa', id);
    }

    // Validação de negócio: validar CPF/CNPJ baseado em tipo_pessoa (se fornecido)
    if (dto.cpfcnpj_pessoa !== undefined) {
      const tipoPessoa = dto.tipo_pessoa !== undefined ? dto.tipo_pessoa : existing.tipo_pessoa;
      await this.validarCpfCnpj(dto.cpfcnpj_pessoa, tipoPessoa);
    }

    // Validação de negócio: validar campos obrigatórios por tipo (se tipo for alterado)
    if (dto.tipo_pessoa !== undefined && dto.tipo_pessoa !== existing.tipo_pessoa) {
      const dtoCompleto = { ...existing, ...dto } as CreatePessoaDto;
      this.validarCamposPorTipo(dtoCompleto);
    }

    // Converter DTO para entidade
    const entity = await this.mapper.toEntity(dto);

    // Atualizar via repositório
    const updated = await this.repository.update(id, entity as any);

    // Registrar auditoria
    await this.auditService.logUpdate('pessoa', existing.id_pessoa, existing, dto);

    // Retornar como DTO
    return this.mapper.toDto(updated);
  }

  /**
   * Remove uma pessoa
   * 
   * @param id - ID da pessoa
   * @returns Promise que resolve com true se removido, false caso contrário
   * @throws ForbiddenException se usuário não tiver permissão 'pessoa.delete'
   */
  @RequirePermission('pessoa.delete')
  @Transactional()
  @Auditable('Pessoa')
  @CacheEvict('pessoa:getById:{0}')
  @CacheEvict('pessoa:list:*', true)
  @CacheEvict('pessoa:findByCpfCnpj:*', true)
  @CacheEvict('pessoa:findByEmail:*', true)
  @CacheEvict('pessoa:findByTipo:*', true)
  @CacheEvict('pessoa:findByUserCreation:*', true)
  async delete(id: number | string): Promise<boolean> {
    // Verificar se pessoa existe
    const existing = this.repository.findByIdWithoutTenant
      ? await this.repository.findByIdWithoutTenant(id)
      : await this.repository.findById(id);
    
    if (!existing) {
      return false;
    }

    // Remover via repositório
    return await this.repository.delete(id);
  }

  /**
   * Busca uma pessoa por ID
   * 
   * @param id - ID da pessoa
   * @returns Promise que resolve com o DTO da pessoa encontrada ou null
   * @throws ForbiddenException se usuário não tiver permissão 'pessoa.read'
   */
  @RequirePermission('pessoa.read')
  @Cacheable('pessoa:getById:{0}', 3600)
  async getById(id: number | string): Promise<PessoaResponseDto | null> {
    const entity = await this.repository.findById(id);
    return entity ? this.mapper.toDto(entity) : null;
  }

  /**
   * Lista pessoas com paginação
   * 
   * @param page - Número da página (padrão: 1)
   * @param limit - Limite de registros por página (padrão: 10)
   * @returns Promise que resolve com resultado paginado
   * @throws ForbiddenException se usuário não tiver permissão 'pessoa.read'
   */
  @RequirePermission('pessoa.read')
  @Cacheable('pessoa:list:{0}:{1}', 300)
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<PessoaResponseDto>> {
    const result = await this.repository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(entity => this.mapper.toDto(entity)),
    };
  }

  /**
   * Busca pessoa por CPF ou CNPJ
   * 
   * @param cpfcnpj - CPF ou CNPJ da pessoa (com ou sem formatação)
   * @returns Promise que resolve com o DTO da pessoa encontrada ou null
   * @throws ForbiddenException se usuário não tiver permissão 'pessoa.read'
   */
  @RequirePermission('pessoa.read')
  @Cacheable('pessoa:findByCpfCnpj:{0}', 3600)
  async findByCpfCnpj(cpfcnpj: string): Promise<PessoaResponseDto | null> {
    const entity = await this.repository.findByCpfCnpj(cpfcnpj);
    return entity ? this.mapper.toDto(entity) : null;
  }

  /**
   * Busca pessoa por email
   * 
   * @param email - Email da pessoa
   * @returns Promise que resolve com o DTO da pessoa encontrada ou null
   * @throws ForbiddenException se usuário não tiver permissão 'pessoa.read'
   */
  @RequirePermission('pessoa.read')
  @Cacheable('pessoa:findByEmail:{0}', 3600)
  async findByEmail(email: string): Promise<PessoaResponseDto | null> {
    const entity = await this.repository.findByEmail(email);
    return entity ? this.mapper.toDto(entity) : null;
  }

  /**
   * Busca pessoas por tipo (Pessoa Física ou Pessoa Jurídica)
   * 
   * @param tipo - Tipo de pessoa: 1 = Pessoa Física (PF), 2 = Pessoa Jurídica (PJ)
   * @returns Promise que resolve com array de DTOs de pessoas do tipo especificado
   * @throws ForbiddenException se usuário não tiver permissão 'pessoa.read'
   */
  @RequirePermission('pessoa.read')
  @Cacheable('pessoa:findByTipo:{0}', 600)
  async findByTipo(tipo: number): Promise<PessoaResponseDto[]> {
    const entities = await this.repository.findByTipo(tipo);
    return entities.map(entity => this.mapper.toDto(entity));
  }

  /**
   * Busca pessoas criadas por um usuário específico
   * 
   * @param userId - ID do usuário que criou as pessoas
   * @returns Promise que resolve com array de DTOs de pessoas criadas pelo usuário
   * @throws ForbiddenException se usuário não tiver permissão 'pessoa.read'
   */
  @RequirePermission('pessoa.read')
  @Cacheable('pessoa:findByUserCreation:{0}', 600)
  async findByUserCreation(userId: number): Promise<PessoaResponseDto[]> {
    const entities = await this.repository.findByUserCreation(userId);
    return entities.map(entity => this.mapper.toDto(entity));
  }

  /**
   * Busca pessoas por papel específico
   * 
   * @param papel - Papel da pessoa: 'cliente', 'produtor', 'portador', 'funcionario', 'fornecedor', 'motorista', 'operador'
   * @returns Promise que resolve com array de DTOs de pessoas com o papel especificado
   * @throws ForbiddenException se usuário não tiver permissão 'pessoa.read'
   */
  @RequirePermission('pessoa.read')
  @Cacheable('pessoa:findByPapel:{0}', 600)
  async findByPapel(papel: string): Promise<PessoaResponseDto[]> {
    const entities = await this.repository.findByPapel(papel);
    return entities.map(entity => this.mapper.toDto(entity));
  }

  /**
   * Valida CPF ou CNPJ baseado no tipo de pessoa
   * 
   * @param cpfcnpj - CPF ou CNPJ a ser validado
   * @param tipoPessoa - Tipo de pessoa: 1 = PF, 2 = PJ
   * @throws BusinessException se CPF/CNPJ for inválido
   */
  private async validarCpfCnpj(cpfcnpj: string, tipoPessoa: number): Promise<void> {
    // Remover formatação
    const cpfcnpjLimpo = cpfcnpj.replace(/[.\-\/ ]/g, '');

    if (tipoPessoa === 1) {
      // Validar CPF (11 dígitos)
      if (cpfcnpjLimpo.length !== 11) {
        throw new BusinessException('CPF deve ter 11 dígitos');
      }
      // TODO: Implementar validação de dígitos verificadores do CPF
    } else if (tipoPessoa === 2) {
      // Validar CNPJ (14 dígitos)
      if (cpfcnpjLimpo.length !== 14) {
        throw new BusinessException('CNPJ deve ter 14 dígitos');
      }
      // TODO: Implementar validação de dígitos verificadores do CNPJ
    } else {
      throw new BusinessException('Tipo de pessoa inválido. Deve ser 1 (PF) ou 2 (PJ)');
    }
  }

  /**
   * Valida campos obrigatórios baseado no tipo de pessoa
   * 
   * @param dto - DTO com dados da pessoa
   * @throws BusinessException se campos obrigatórios não estiverem preenchidos
   */
  private validarCamposPorTipo(dto: CreatePessoaDto | UpdatePessoaDto): void {
    if (dto.tipo_pessoa === 1) {
      // Pessoa Física: validar CPF e identidade
      if (dto.cpfcnpj_pessoa && !dto.cpfcnpj_pessoa.replace(/[.\-\/ ]/g, '').match(/^\d{11}$/)) {
        throw new BusinessException('CPF inválido para Pessoa Física');
      }
    } else if (dto.tipo_pessoa === 2) {
      // Pessoa Jurídica: validar CNPJ e nome fantasia
      if (dto.cpfcnpj_pessoa && !dto.cpfcnpj_pessoa.replace(/[.\-\/ ]/g, '').match(/^\d{14}$/)) {
        throw new BusinessException('CNPJ inválido para Pessoa Jurídica');
      }
      if (!dto.nomefantasia_pessoa) {
        throw new BusinessException('Nome fantasia é obrigatório para Pessoa Jurídica');
      }
    }
  }
}
