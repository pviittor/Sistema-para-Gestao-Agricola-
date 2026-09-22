/**
 * Testes unitários para TituloReceberApplicationService
 * 
 * Estes testes verificam a lógica de negócio do Application Service,
 * incluindo validações, regras de negócio e integração com repositórios e mappers.
 */

import { TituloReceberApplicationService } from './TituloReceberApplicationService';
import { ITituloReceberRepository } from '../../../infrastructure/repository/ITituloReceberRepository';
import { IParcelaTituloReceberRepository } from '../../../infrastructure/repository/IParcelaTituloReceberRepository';
import { IRateioPlanoContaTituloReceberRepository } from '../../../infrastructure/repository/IRateioPlanoContaTituloReceberRepository';
import { IRateioCentroCustoTituloReceberRepository } from '../../../infrastructure/repository/IRateioCentroCustoTituloReceberRepository';
import { IPessoaRepository } from '../../../infrastructure/repository/IPessoaRepository';
import { IFazendaRepository } from '../../../infrastructure/repository/IFazendaRepository';
import { ISafraRepository } from '../../../infrastructure/repository/ISafraRepository';
import { IPlanoContaGerencialRepository } from '../../../infrastructure/repository/IPlanoContaGerencialRepository';
import { ICentroCustoRepository } from '../../../infrastructure/repository/ICentroCustoRepository';
import { IMoedaConversionService } from '../moedaConversion/IMoedaConversionService';
import { IAuditService } from '../../../core/audit/IAuditService';
import { TituloReceberMapper } from '../../mappers/TituloReceberMapper';
import { CreateTituloReceberDto } from '../../dto/tituloReceber/CreateTituloReceberDto';
import { UpdateTituloReceberDto } from '../../dto/tituloReceber/UpdateTituloReceberDto';
import { TituloReceberResponseDto } from '../../dto/tituloReceber/TituloReceberResponseDto';
import { NotFoundException, BusinessException, ForbiddenException } from '../../../core/exceptions';
import { StatusTituloReceber } from '../../../models/TituloReceber';
import TituloReceber from '../../../models/TituloReceber';
import { getRequestContext } from '../../../core/authorization/helpers';
import { RequestContext } from '../../../core/context/RequestContext';

jest.mock('../../../core/authorization/helpers', () => ({
  getRequestContext: jest.fn(),
}));

const mockTituloReceberRepository: jest.Mocked<ITituloReceberRepository> = {
  findById: jest.fn(),
  findAll: jest.fn(),
  findAllPaginated: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findBySafra: jest.fn(),
  findByFazenda: jest.fn(),
  findByCliente: jest.fn(),
  findByStatus: jest.fn(),
  findByNumeroTitulo: jest.fn(),
  findByDataLancamento: jest.fn(),
} as any;

const mockParcelaTituloReceberRepository: jest.Mocked<IParcelaTituloReceberRepository> = {
  findByTituloReceber: jest.fn(),
} as any;

const mockRateioPlanoContaRepository: jest.Mocked<IRateioPlanoContaTituloReceberRepository> = {
  findByTituloReceber: jest.fn(),
} as any;

const mockRateioCentroCustoRepository: jest.Mocked<IRateioCentroCustoTituloReceberRepository> = {
  findByTituloReceber: jest.fn(),
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

const mockMapper: jest.Mocked<TituloReceberMapper> = {
  toEntity: jest.fn(),
  toDto: jest.fn(),
} as any;

describe('TituloReceberApplicationService', () => {
  let service: TituloReceberApplicationService;
  let mockRequestContext: RequestContext;

  beforeEach(() => {
    jest.clearAllMocks();

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

    (getRequestContext as jest.Mock).mockReturnValue(mockRequestContext);

    service = new TituloReceberApplicationService(
      mockAuditService,
      mockTituloReceberRepository,
      mockParcelaTituloReceberRepository,
      mockRateioPlanoContaRepository,
      mockRateioCentroCustoRepository,
      mockPessoaRepository,
      mockFazendaRepository,
      mockSafraRepository,
      mockPlanoContaGerencialRepository,
      mockCentroCustoRepository,
      mockMoedaConversionService
    );

    (service as any).mapper = mockMapper;
  });

  describe('create', () => {
    const createDto: CreateTituloReceberDto = {
      idCliente: 1,
      idPortador: 2,
      idProdutor: 3,
      idFazenda: 1,
      idSafra: 1,
      idMoeda: 1,
      dataLancamento: '2024-01-15',
      numeroTitulo: 'TR-001',
      valorTitulo: 10000.00,
      quantidadeParcelas: 3,
      status: StatusTituloReceber.ABERTO,
    };

    it('deve criar título com sucesso', async () => {
      const createdEntity = {
        id: 1,
        ...createDto,
        tenantId: 1,
        usercreation: 1,
        datecreation: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as TituloReceber;

      const responseDto: TituloReceberResponseDto = {
        id: 1,
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;

      mockTituloReceberRepository.findByNumeroTitulo.mockResolvedValue(null);
      mockPessoaRepository.findById.mockResolvedValue({ id: 1, tenantId: 1 } as any);
      mockFazendaRepository.findById.mockResolvedValue({ id: 1, tenantId: 1 } as any);
      mockSafraRepository.findById.mockResolvedValue({ id: 1, tenantId: 1 } as any);
      mockMoedaConversionService.converterParaMoedaPadrao.mockResolvedValue({
        valorMoedaOriginal: 10000.00,
        valorMoedaPadrao: 10000.00,
      });
      mockMapper.toEntity.mockResolvedValue({ ...createDto } as any);
      mockTituloReceberRepository.create.mockResolvedValue(createdEntity);
      mockMapper.toDto.mockReturnValue(responseDto);

      const result = await service.create(createDto);

      expect(mockTituloReceberRepository.findByNumeroTitulo).toHaveBeenCalledWith(createDto.numeroTitulo);
      expect(mockMapper.toEntity).toHaveBeenCalledWith(createDto);
      expect(mockTituloReceberRepository.create).toHaveBeenCalled();
      expect(mockMapper.toDto).toHaveBeenCalledWith(createdEntity);
      expect(mockAuditService.logCreate).toHaveBeenCalled();
      expect(result).toEqual(responseDto);
    });

    it('deve lançar BusinessException se número do título já existir', async () => {
      const tituloExistente = { id: 1, numeroTitulo: 'TR-001' } as TituloReceber;
      mockTituloReceberRepository.findByNumeroTitulo.mockResolvedValue(tituloExistente);

      await expect(service.create(createDto)).rejects.toThrow(BusinessException);
      expect(mockTituloReceberRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const updateDto: UpdateTituloReceberDto = {
      valorTitulo: 15000.00,
    };

    it('deve atualizar título com sucesso', async () => {
      const existingEntity = {
        id: 1,
        numeroTitulo: 'TR-001',
        valorTitulo: 10000.00,
        status: StatusTituloReceber.ABERTO,
        tenantId: 1,
        idMoeda: 1,
        dataLancamento: new Date('2024-01-15'),
      } as TituloReceber;

      const updatedEntity = {
        ...existingEntity,
        valorTitulo: 15000.00,
      } as TituloReceber;

      const responseDto: TituloReceberResponseDto = {
        id: 1,
        valorTitulo: 15000.00,
      } as any;

      mockTituloReceberRepository.findById.mockResolvedValue(existingEntity);
      mockMoedaConversionService.converterParaMoedaPadrao.mockResolvedValue({
        valorMoedaOriginal: 15000.00,
        valorMoedaPadrao: 15000.00,
      });
      mockMapper.toEntity.mockResolvedValue({ valorTitulo: updateDto.valorTitulo } as any);
      mockTituloReceberRepository.update.mockResolvedValue(updatedEntity);
      mockMapper.toDto.mockReturnValue(responseDto);

      const result = await service.update(1, updateDto);

      expect(mockTituloReceberRepository.findById).toHaveBeenCalledWith(1);
      expect(mockMapper.toEntity).toHaveBeenCalledWith(updateDto);
      expect(mockTituloReceberRepository.update).toHaveBeenCalled();
      expect(result).toEqual(responseDto);
    });

    it('deve lançar NotFoundException se título não existir', async () => {
      mockTituloReceberRepository.findById.mockResolvedValue(null);

      await expect(service.update(1, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('deve remover título com sucesso', async () => {
      const existingEntity = {
        id: 1,
        status: StatusTituloReceber.ABERTO,
      } as TituloReceber;

      mockTituloReceberRepository.findById.mockResolvedValue(existingEntity);
      mockParcelaTituloReceberRepository.findByTituloReceber.mockResolvedValue([]);
      mockTituloReceberRepository.delete.mockResolvedValue(true);

      const result = await service.delete(1);

      expect(mockTituloReceberRepository.findById).toHaveBeenCalledWith(1);
      expect(mockTituloReceberRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });
  });

  describe('getById', () => {
    it('deve retornar DTO do título encontrado', async () => {
      const entity = { id: 1, numeroTitulo: 'TR-001' } as TituloReceber;
      const dto: TituloReceberResponseDto = { id: 1, numeroTitulo: 'TR-001' } as any;

      mockTituloReceberRepository.findById.mockResolvedValue(entity);
      mockMapper.toDto.mockReturnValue(dto);

      const result = await service.getById(1);

      expect(result).toEqual(dto);
    });
  });

  describe('cancelar', () => {
    it('deve cancelar título com sucesso', async () => {
      const existingEntity = {
        id: 1,
        status: StatusTituloReceber.ABERTO,
        numeroTitulo: 'TR-001',
      } as TituloReceber;

      const updatedEntity = {
        ...existingEntity,
        status: StatusTituloReceber.CANCELADO,
      } as TituloReceber;

      const responseDto: TituloReceberResponseDto = {
        id: 1,
        status: StatusTituloReceber.CANCELADO,
      } as any;

      mockTituloReceberRepository.findById.mockResolvedValue(existingEntity);
      mockParcelaTituloReceberRepository.findByTituloReceber.mockResolvedValue([]);
      mockTituloReceberRepository.update.mockResolvedValue(updatedEntity);
      mockMapper.toDto.mockReturnValue(responseDto);

      const result = await service.cancelar(1);

      expect(result.status).toBe(StatusTituloReceber.CANCELADO);
    });
  });
});
