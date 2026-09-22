/**
 * Testes unitários para TituloPagarApplicationService
 * 
 * Estes testes verificam a lógica de negócio do Application Service,
 * incluindo validações, regras de negócio e integração com repositórios e mappers.
 */

import { TituloPagarApplicationService } from './TituloPagarApplicationService';
import { ITituloPagarRepository } from '../../../infrastructure/repository/ITituloPagarRepository';
import { IParcelaTituloPagarRepository } from '../../../infrastructure/repository/IParcelaTituloPagarRepository';
import { IRateioPlanoContaTituloPagarRepository } from '../../../infrastructure/repository/IRateioPlanoContaTituloPagarRepository';
import { IRateioCentroCustoTituloPagarRepository } from '../../../infrastructure/repository/IRateioCentroCustoTituloPagarRepository';
import { IPessoaRepository } from '../../../infrastructure/repository/IPessoaRepository';
import { IFazendaRepository } from '../../../infrastructure/repository/IFazendaRepository';
import { ISafraRepository } from '../../../infrastructure/repository/ISafraRepository';
import { IPlanoContaGerencialRepository } from '../../../infrastructure/repository/IPlanoContaGerencialRepository';
import { ICentroCustoRepository } from '../../../infrastructure/repository/ICentroCustoRepository';
import { IMoedaConversionService } from '../moedaConversion/IMoedaConversionService';
import { IAuditService } from '../../../core/audit/IAuditService';
import { TituloPagarMapper } from '../../mappers/TituloPagarMapper';
import { CreateTituloPagarDto } from '../../dto/tituloPagar/CreateTituloPagarDto';
import { UpdateTituloPagarDto } from '../../dto/tituloPagar/UpdateTituloPagarDto';
import { TituloPagarResponseDto } from '../../dto/tituloPagar/TituloPagarResponseDto';
import { NotFoundException, BusinessException, ForbiddenException } from '../../../core/exceptions';
import { StatusTituloPagar } from '../../../models/TituloPagar';
import { StatusParcela } from '../../../models/ParcelaTituloPagar';
import TituloPagar from '../../../models/TituloPagar';
import { getRequestContext } from '../../../core/authorization/helpers';
import { RequestContext } from '../../../core/context/RequestContext';

// Mock do getRequestContext
jest.mock('../../../core/authorization/helpers', () => ({
  getRequestContext: jest.fn(),
}));

// Mock dos repositórios
const mockTituloPagarRepository: jest.Mocked<ITituloPagarRepository> = {
  findById: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findAllPaginated: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findBySafra: jest.fn(),
  findByFazenda: jest.fn(),
  findByFornecedor: jest.fn(),
  findByStatus: jest.fn(),
  findByNumeroTitulo: jest.fn(),
  findByDataLancamento: jest.fn(),
} as any;

const mockParcelaTituloPagarRepository: jest.Mocked<IParcelaTituloPagarRepository> = {
  findById: jest.fn(),
  findAll: jest.fn(),
  findByTituloPagar: jest.fn(),
  findByStatus: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
} as any;

const mockRateioPlanoContaRepository: jest.Mocked<IRateioPlanoContaTituloPagarRepository> = {
  findByTituloPagar: jest.fn(),
  findByPlanoContaGerencial: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
} as any;

const mockRateioCentroCustoRepository: jest.Mocked<IRateioCentroCustoTituloPagarRepository> = {
  findByTituloPagar: jest.fn(),
  findByCentroCusto: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
} as any;

const mockPessoaRepository: jest.Mocked<IPessoaRepository> = {
  findById: jest.fn(),
} as any;

const mockFazendaRepository: jest.Mocked<IFazendaRepository> = {
  findById: jest.fn(),
} as any;

const mockSafraRepository: jest.Mocked<ISafraRepository> = {
  findById: jest.fn(),
} as any;

const mockPlanoContaGerencialRepository: jest.Mocked<IPlanoContaGerencialRepository> = {
  findById: jest.fn(),
} as any;

const mockCentroCustoRepository: jest.Mocked<ICentroCustoRepository> = {
  findById: jest.fn(),
} as any;

const mockMoedaConversionService: jest.Mocked<IMoedaConversionService> = {
  converterParaMoedaPadrao: jest.fn(),
} as any;

const mockAuditService: jest.Mocked<IAuditService> = {
  logCreate: jest.fn(),
  logUpdate: jest.fn(),
  logDelete: jest.fn(),
} as any;

// Mock do mapper
const mockMapper: jest.Mocked<TituloPagarMapper> = {
  toEntity: jest.fn(),
  toDto: jest.fn(),
} as any;

describe('TituloPagarApplicationService', () => {
  let service: TituloPagarApplicationService;
  let mockRequestContext: RequestContext;

  beforeEach(() => {
    jest.clearAllMocks();

    // Criar mock do RequestContext
    mockRequestContext = {
      getUserId: jest.fn().mockReturnValue(1),
      getTenantId: jest.fn().mockReturnValue(1),
      getRequestId: jest.fn().mockReturnValue('test-request-id'),
      setUserId: jest.fn(),
      setTenantId: jest.fn(),
      setRequestId: jest.fn(),
      getStartTime: jest.fn().mockReturnValue(Date.now()),
      getDuration: jest.fn().mockReturnValue(100),
      clear: jest.fn(),
      toJSON: jest.fn().mockReturnValue({}),
    } as any;

    // Mock do getRequestContext
    (getRequestContext as jest.Mock).mockReturnValue(mockRequestContext);

    // Criar service com repositórios mockados
    service = new TituloPagarApplicationService(
      mockAuditService,
      mockTituloPagarRepository,
      mockParcelaTituloPagarRepository,
      mockRateioPlanoContaRepository,
      mockRateioCentroCustoRepository,
      mockPessoaRepository,
      mockFazendaRepository,
      mockSafraRepository,
      mockPlanoContaGerencialRepository,
      mockCentroCustoRepository,
      mockMoedaConversionService
    );

    // Substituir mapper interno por mock
    (service as any).mapper = mockMapper;
  });

  describe('create', () => {
    const createDto: CreateTituloPagarDto = {
      idFornecedor: 1,
      idPortador: 2,
      idProdutor: 3,
      idFazenda: 1,
      idSafra: 1,
      idMoeda: 1,
      dataLancamento: '2024-01-15',
      numeroTitulo: 'TP-001',
      valorTitulo: 10000.00,
      quantidadeParcelas: 3,
      status: StatusTituloPagar.ABERTO,
    };

    it('deve criar título com sucesso', async () => {
      // Arrange
      const createdEntity = {
        id: 1,
        ...createDto,
        tenantId: 1,
        usercreation: 1,
        datecreation: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as TituloPagar;

      const responseDto: TituloPagarResponseDto = {
        id: 1,
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;

      mockTituloPagarRepository.findByNumeroTitulo.mockResolvedValue(null);
      mockPessoaRepository.findById.mockResolvedValue({ id: 1, tenantId: 1 } as any);
      mockFazendaRepository.findById.mockResolvedValue({ id: 1, tenantId: 1 } as any);
      mockSafraRepository.findById.mockResolvedValue({ id: 1, tenantId: 1 } as any);
      mockMoedaConversionService.converterParaMoedaPadrao.mockResolvedValue({
        valorMoedaOriginal: 10000.00,
        valorMoedaPadrao: 10000.00,
      });
      mockMapper.toEntity.mockResolvedValue({ ...createDto } as any);
      mockTituloPagarRepository.create.mockResolvedValue(createdEntity);
      mockMapper.toDto.mockReturnValue(responseDto);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(mockTituloPagarRepository.findByNumeroTitulo).toHaveBeenCalledWith(createDto.numeroTitulo);
      expect(mockMapper.toEntity).toHaveBeenCalledWith(createDto);
      expect(mockTituloPagarRepository.create).toHaveBeenCalled();
      expect(mockMapper.toDto).toHaveBeenCalledWith(createdEntity);
      expect(mockAuditService.logCreate).toHaveBeenCalled();
      expect(result).toEqual(responseDto);
    });

    it('deve lançar BusinessException se número do título já existir', async () => {
      // Arrange
      const tituloExistente = { id: 1, numeroTitulo: 'TP-001' } as TituloPagar;
      mockTituloPagarRepository.findByNumeroTitulo.mockResolvedValue(tituloExistente);

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(BusinessException);
      expect(mockTituloPagarRepository.create).not.toHaveBeenCalled();
    });

    it('deve lançar ForbiddenException se usuário não estiver autenticado', async () => {
      // Arrange
      (mockRequestContext.getUserId as jest.Mock).mockReturnValue(undefined);

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(ForbiddenException);
      expect(mockTituloPagarRepository.create).not.toHaveBeenCalled();
    });

    it('deve lançar ForbiddenException se tenant não estiver identificado', async () => {
      // Arrange
      (mockRequestContext.getTenantId as jest.Mock).mockReturnValue(undefined);

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(ForbiddenException);
      expect(mockTituloPagarRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const updateDto: UpdateTituloPagarDto = {
      valorTitulo: 15000.00,
    };

    it('deve atualizar título com sucesso', async () => {
      // Arrange
      const existingEntity = {
        id: 1,
        numeroTitulo: 'TP-001',
        valorTitulo: 10000.00,
        status: StatusTituloPagar.ABERTO,
        tenantId: 1,
        idMoeda: 1,
        dataLancamento: new Date('2024-01-15'),
      } as TituloPagar;

      const updatedEntity = {
        ...existingEntity,
        valorTitulo: 15000.00,
      } as TituloPagar;

      const responseDto: TituloPagarResponseDto = {
        id: 1,
        valorTitulo: 15000.00,
      } as any;

      mockTituloPagarRepository.findById.mockResolvedValue(existingEntity);
      mockMoedaConversionService.converterParaMoedaPadrao.mockResolvedValue({
        valorMoedaOriginal: 15000.00,
        valorMoedaPadrao: 15000.00,
      });
      mockMapper.toEntity.mockResolvedValue({ valorTitulo: updateDto.valorTitulo } as any);
      mockTituloPagarRepository.update.mockResolvedValue(updatedEntity);
      mockMapper.toDto.mockReturnValue(responseDto);

      // Act
      const result = await service.update(1, updateDto);

      // Assert
      expect(mockTituloPagarRepository.findById).toHaveBeenCalledWith(1);
      expect(mockMapper.toEntity).toHaveBeenCalledWith(updateDto);
      expect(mockTituloPagarRepository.update).toHaveBeenCalled();
      expect(mockMapper.toDto).toHaveBeenCalledWith(updatedEntity);
      expect(result).toEqual(responseDto);
    });

    it('deve lançar NotFoundException se título não existir', async () => {
      // Arrange
      mockTituloPagarRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(1, updateDto)).rejects.toThrow(NotFoundException);
      expect(mockTituloPagarRepository.update).not.toHaveBeenCalled();
    });

    it('deve lançar BusinessException se título estiver totalmente baixado', async () => {
      // Arrange
      const existingEntity = {
        id: 1,
        status: StatusTituloPagar.BAIXADO,
      } as TituloPagar;

      mockTituloPagarRepository.findById.mockResolvedValue(existingEntity);

      // Act & Assert
      await expect(service.update(1, updateDto)).rejects.toThrow(BusinessException);
      expect(mockTituloPagarRepository.update).not.toHaveBeenCalled();
    });

    it('deve lançar BusinessException se título estiver cancelado', async () => {
      // Arrange
      const existingEntity = {
        id: 1,
        status: StatusTituloPagar.CANCELADO,
      } as TituloPagar;

      mockTituloPagarRepository.findById.mockResolvedValue(existingEntity);

      // Act & Assert
      await expect(service.update(1, updateDto)).rejects.toThrow(BusinessException);
      expect(mockTituloPagarRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('deve remover título com sucesso', async () => {
      // Arrange
      const existingEntity = {
        id: 1,
        status: StatusTituloPagar.ABERTO,
      } as TituloPagar;

      mockTituloPagarRepository.findById.mockResolvedValue(existingEntity);
      mockParcelaTituloPagarRepository.findByTituloPagar.mockResolvedValue([]);
      mockTituloPagarRepository.delete.mockResolvedValue(true);

      // Act
      const result = await service.delete(1);

      // Assert
      expect(mockTituloPagarRepository.findById).toHaveBeenCalledWith(1);
      expect(mockParcelaTituloPagarRepository.findByTituloPagar).toHaveBeenCalledWith(1);
      expect(mockTituloPagarRepository.delete).toHaveBeenCalledWith(1);
      expect(mockAuditService.logDelete).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('deve retornar false se título não existir', async () => {
      // Arrange
      mockTituloPagarRepository.findById.mockResolvedValue(null);

      // Act
      const result = await service.delete(1);

      // Assert
      expect(result).toBe(false);
      expect(mockTituloPagarRepository.delete).not.toHaveBeenCalled();
    });

    it('deve lançar BusinessException se título tiver parcelas baixadas', async () => {
      // Arrange
      const existingEntity = {
        id: 1,
        status: StatusTituloPagar.ABERTO,
      } as TituloPagar;

      const parcelaBaixada = {
        id: 1,
        status: StatusParcela.BAIXADA,
      } as any;

      mockTituloPagarRepository.findById.mockResolvedValue(existingEntity);
      mockParcelaTituloPagarRepository.findByTituloPagar.mockResolvedValue([parcelaBaixada]);

      // Act & Assert
      await expect(service.delete(1)).rejects.toThrow(BusinessException);
      expect(mockTituloPagarRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('deve retornar DTO do título encontrado', async () => {
      // Arrange
      const entity = { id: 1, numeroTitulo: 'TP-001' } as TituloPagar;
      const dto: TituloPagarResponseDto = { id: 1, numeroTitulo: 'TP-001' } as any;

      mockTituloPagarRepository.findById.mockResolvedValue(entity);
      mockMapper.toDto.mockReturnValue(dto);

      // Act
      const result = await service.getById(1);

      // Assert
      expect(mockTituloPagarRepository.findById).toHaveBeenCalledWith(1);
      expect(mockMapper.toDto).toHaveBeenCalledWith(entity);
      expect(result).toEqual(dto);
    });

    it('deve retornar null se título não existir', async () => {
      // Arrange
      mockTituloPagarRepository.findById.mockResolvedValue(null);

      // Act
      const result = await service.getById(1);

      // Assert
      expect(result).toBeNull();
      expect(mockMapper.toDto).not.toHaveBeenCalled();
    });
  });

  describe('list', () => {
    it('deve retornar lista paginada de títulos', async () => {
      // Arrange
      const entities = [
        { id: 1, numeroTitulo: 'TP-001' } as TituloPagar,
        { id: 2, numeroTitulo: 'TP-002' } as TituloPagar,
      ];

      const dtos: TituloPagarResponseDto[] = [
        { id: 1, numeroTitulo: 'TP-001' } as any,
        { id: 2, numeroTitulo: 'TP-002' } as any,
      ];

      mockTituloPagarRepository.findAllPaginated.mockResolvedValue({
        data: entities,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      mockMapper.toDto
        .mockReturnValueOnce(dtos[0])
        .mockReturnValueOnce(dtos[1]);

      // Act
      const result = await service.list(1, 10);

      // Assert
      expect(mockTituloPagarRepository.findAllPaginated).toHaveBeenCalledWith(1, 10);
      expect(result.data).toEqual(dtos);
      expect(result.total).toBe(2);
    });
  });

  describe('cancelar', () => {
    it('deve cancelar título com sucesso', async () => {
      // Arrange
      const existingEntity = {
        id: 1,
        status: StatusTituloPagar.ABERTO,
        numeroTitulo: 'TP-001',
      } as TituloPagar;

      const parcelas = [
        { id: 1, status: StatusParcela.ABERTA } as any,
        { id: 2, status: StatusParcela.ABERTA } as any,
      ];

      const updatedEntity = {
        ...existingEntity,
        status: StatusTituloPagar.CANCELADO,
      } as TituloPagar;

      const responseDto: TituloPagarResponseDto = {
        id: 1,
        status: StatusTituloPagar.CANCELADO,
      } as any;

      mockTituloPagarRepository.findById.mockResolvedValue(existingEntity);
      mockParcelaTituloPagarRepository.findByTituloPagar.mockResolvedValue(parcelas);
      mockTituloPagarRepository.update.mockResolvedValue(updatedEntity);
      mockMapper.toDto.mockReturnValue(responseDto);

      // Act
      const result = await service.cancelar(1);

      // Assert
      expect(mockTituloPagarRepository.findById).toHaveBeenCalledWith(1);
      expect(mockParcelaTituloPagarRepository.findByTituloPagar).toHaveBeenCalledWith(1);
      expect(mockTituloPagarRepository.update).toHaveBeenCalled();
      expect(result.status).toBe(StatusTituloPagar.CANCELADO);
    });

    it('deve lançar NotFoundException se título não existir', async () => {
      // Arrange
      mockTituloPagarRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.cancelar(1)).rejects.toThrow(NotFoundException);
    });
  });
});
